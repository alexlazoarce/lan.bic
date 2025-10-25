import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMetrics } from '../../entities/tenant-metrics.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantMetrics)
    private readonly tenantMetricsRepository: Repository<TenantMetrics>,
    private readonly connection: Connection,
  ) {}

  async createTenant(
    companyName: string,
    subdomain: string,
    planType: string = 'basic',
  ): Promise<Tenant> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si el subdominio ya existe
      const existingTenant = await this.tenantRepository.findOne({
        where: { subdomain },
      });

      if (existingTenant) {
        throw new ConflictException('El subdominio ya está en uso');
      }

      // Crear el tenant
      const tenant = this.tenantRepository.create({
        companyName,
        subdomain,
        planType,
        status: 'active',
      });

      await queryRunner.manager.save(tenant);

      // Crear el schema para el tenant
      await queryRunner.query(
        `CREATE SCHEMA IF NOT EXISTS tenant_${tenant.id}`,
      );

      // Inicializar métricas del tenant
      const metrics = this.tenantMetricsRepository.create({
        tenantId: tenant.id,
        storageUsed: 0,
        activeUsers: 0,
        lastActivity: new Date(),
      });

      await queryRunner.manager.save(metrics);
      await queryRunner.commitTransaction();

      return tenant;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain, status: 'active' },
    });

    if (!tenant) {
      throw new NotFoundException('Inquilino no encontrado');
    }

    return tenant;
  }

  async getTenantById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Inquilino no encontrado');
    }

    return tenant;
  }

  async updateTenant(
    id: string,
    updateData: Partial<Tenant>,
  ): Promise<Tenant> {
    const tenant = await this.getTenantById(id);
    Object.assign(tenant, updateData);
    return this.tenantRepository.save(tenant);
  }

  async suspendTenant(id: string): Promise<void> {
    const tenant = await this.getTenantById(id);
    tenant.status = 'suspended';
    await this.tenantRepository.save(tenant);
  }

  async reactivateTenant(id: string): Promise<void> {
    const tenant = await this.getTenantById(id);
    tenant.status = 'active';
    await this.tenantRepository.save(tenant);
  }

  async deleteTenant(id: string): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tenant = await this.getTenantById(id);
      
      // Eliminar el schema del tenant
      await queryRunner.query(
        `DROP SCHEMA IF EXISTS tenant_${tenant.id} CASCADE`,
      );

      // Eliminar los registros relacionados
      await queryRunner.manager.delete(TenantMetrics, { tenantId: id });
      await queryRunner.manager.delete(Tenant, { id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateTenantMetrics(
    tenantId: string,
    metrics: Partial<TenantMetrics>,
  ): Promise<TenantMetrics> {
    const tenantMetrics = await this.tenantMetricsRepository.findOne({
      where: { tenantId },
    });

    if (!tenantMetrics) {
      throw new NotFoundException('Métricas del inquilino no encontradas');
    }

    Object.assign(tenantMetrics, metrics);
    return this.tenantMetricsRepository.save(tenantMetrics);
  }
}