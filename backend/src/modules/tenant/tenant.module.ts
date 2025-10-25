import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMetrics } from '../../entities/tenant-metrics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantMetrics]),
  ],
  providers: [TenantService],
  controllers: [TenantController],
  exports: [TenantService],
})
export class TenantModule {}