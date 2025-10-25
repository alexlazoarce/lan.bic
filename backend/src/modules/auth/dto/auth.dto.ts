export class RegisterTenantDto {
  companyName: string;
  subdomain: string;
  adminEmail: string;
  adminPassword: string;
  planType?: string;
}

export class LoginDto {
  email: string;
  password: string;
  subdomain: string;
}

export class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}