import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { TenantService } from '../tenant.service';
import { Tenant } from '../../../entities/tenant.entity';
import { TenantMetrics } from '../../../entities/tenant-metrics.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TenantService', () => {
  let service: TenantService;
  let tenantRepository: Repository<Tenant>;
  let tenantMetricsRepository: Repository<TenantMetrics>;
  let connection: Connection;

  const mockTenantRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockTenantMetricsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockConnection = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      query: jest.fn(),
      manager: {
        save: jest.fn(),
        delete: jest.fn(),
      },
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: getRepositoryToken(TenantMetrics),
          useValue: mockTenantMetricsRepository,
        },
        {
          provide: Connection,
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    tenantMetricsRepository = module.get<Repository<TenantMetrics>>(
      getRepositoryToken(TenantMetrics),
    );
    connection = module.get<Connection>(Connection);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTenant', () => {
    it('should create a new tenant with schema and metrics', async () => {
      const createTenantDto = {
        companyName: 'Test Company',
        subdomain: 'test',
        planType: 'basic',
      };

      const mockTenant = {
        id: '1',
        ...createTenantDto,
        status: 'active',
      };

      const mockMetrics = {
        tenantId: '1',
        storageUsed: 0,
        activeUsers: 0,
        lastActivity: expect.any(Date),
      };

      mockTenantRepository.findOne.mockResolvedValue(null);
      mockTenantRepository.create.mockReturnValue(mockTenant);
      mockTenantMetricsRepository.create.mockReturnValue(mockMetrics);

      const result = await service.createTenant(
        createTenantDto.companyName,
        createTenantDto.subdomain,
        createTenantDto.planType,
      );

      expect(result).toEqual(mockTenant);
      expect(mockConnection.createQueryRunner).toHaveBeenCalled();
    });

    it('should throw ConflictException if subdomain exists', async () => {
      const existingTenant = {
        id: '1',
        subdomain: 'test',
      };

      mockTenantRepository.findOne.mockResolvedValue(existingTenant);

      await expect(
        service.createTenant('Test Company', 'test', 'basic'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getTenantBySubdomain', () => {
    it('should return tenant if found', async () => {
      const mockTenant = {
        id: '1',
        subdomain: 'test',
        status: 'active',
      };

      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.getTenantBySubdomain('test');
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantRepository.findOne.mockResolvedValue(null);

      await expect(service.getTenantBySubdomain('test')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});