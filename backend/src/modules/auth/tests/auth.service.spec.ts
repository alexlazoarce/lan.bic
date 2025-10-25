import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { TenantService } from '../../tenant/tenant.service';
import { User } from '../../../entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let tenantService: TenantService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockTenantService = {
    createTenant: jest.fn(),
    getTenantBySubdomain: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    tenantService = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerTenant', () => {
    it('should create a new tenant and admin user', async () => {
      const registerDto = {
        companyName: 'Test Company',
        subdomain: 'test',
        adminEmail: 'admin@test.com',
        adminPassword: 'password123',
        planType: 'basic',
      };

      const mockTenant = {
        id: '1',
        companyName: registerDto.companyName,
        subdomain: registerDto.subdomain,
      };

      const mockAdmin = {
        id: 1,
        email: registerDto.adminEmail,
        roles: ['admin'],
      };

      mockTenantService.createTenant.mockResolvedValue(mockTenant);
      mockUserRepository.create.mockReturnValue(mockAdmin);
      mockUserRepository.save.mockResolvedValue(mockAdmin);

      const result = await service.registerTenant(registerDto);

      expect(result).toEqual({
        message: 'Inquilino y administrador creados exitosamente',
        tenantId: mockTenant.id,
      });
      expect(mockTenantService.createTenant).toHaveBeenCalledWith(
        registerDto.companyName,
        registerDto.subdomain,
        registerDto.planType,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('correctPassword', 10),
        roles: ['user'],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'test@example.com',
        'correctPassword',
      );

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.id).toBe(mockUser.id);
    });

    it('should return null if credentials are invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('correctPassword', 10),
        roles: ['user'],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'test@example.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
    });
  });
});