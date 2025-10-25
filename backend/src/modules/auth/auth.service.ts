import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../entities/user.entity';
import { TenantService } from '../tenant/tenant.service';
import { RegisterTenantDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly tenantService: TenantService,
    private readonly connection: Connection,
  ) {}

  async registerTenant(registerDto: RegisterTenantDto): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear el inquilino y su schema
      const tenant = await this.tenantService.createTenant(
        registerDto.companyName,
        registerDto.subdomain,
        registerDto.planType,
      );

      // Crear el usuario administrador
      const hashedPassword = await bcrypt.hash(registerDto.adminPassword, 10);
      const admin = this.userRepository.create({
        email: registerDto.adminEmail,
        password: hashedPassword,
        roles: ['admin'],
        tenantId: tenant.id,
      });

      await queryRunner.manager.save(admin);
      await queryRunner.commitTransaction();

      return {
        message: 'Inquilino y administrador creados exitosamente',
        tenantId: tenant.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505') { // Unique violation in PostgreSQL
        throw new ConflictException('El subdominio o email ya están en uso');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto) {
    // Verificar que el inquilino existe
    const tenant = await this.tenantService.getTenantBySubdomain(loginDto.subdomain);
    if (!tenant) {
      throw new UnauthorizedException('Inquilino no encontrado');
    }

    // Validar credenciales
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario pertenece al inquilino correcto
    if (user.tenantId !== tenant.id) {
      throw new UnauthorizedException('Usuario no pertenece a este inquilino');
    }

    return this.generateToken(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);
  }

  private generateToken(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }
}