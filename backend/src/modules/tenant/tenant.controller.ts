import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @Roles('superadmin')
  async getAllTenants() {
    return this.tenantService.getAllTenants();
  }

  @Get(':id')
  @Roles('superadmin', 'admin')
  async getTenant(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Put(':id')
  @Roles('superadmin', 'admin')
  async updateTenant(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.updateTenant(id, updateTenantDto);
  }

  @Put(':id/suspend')
  @Roles('superadmin')
  async suspendTenant(@Param('id') id: string) {
    return this.tenantService.suspendTenant(id);
  }

  @Put(':id/reactivate')
  @Roles('superadmin')
  async reactivateTenant(@Param('id') id: string) {
    return this.tenantService.reactivateTenant(id);
  }

  @Delete(':id')
  @Roles('superadmin')
  async deleteTenant(@Param('id') id: string) {
    return this.tenantService.deleteTenant(id);
  }
}