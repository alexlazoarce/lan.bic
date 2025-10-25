export interface JwtPayload {
  sub: number;      // ID del usuario
  email: string;    // Email del usuario
  tenantId: string; // ID del inquilino
  roles: string[];  // Roles del usuario
  iat?: number;     // Issued at
  exp?: number;     // Expiration time
}