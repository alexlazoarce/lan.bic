import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsEnum(['basic', 'premium', 'enterprise'])
  @IsOptional()
  planType?: string;

  @IsEnum(['active', 'suspended'])
  @IsOptional()
  status?: string;
}