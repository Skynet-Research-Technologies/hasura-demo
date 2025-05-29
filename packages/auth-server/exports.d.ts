import { Express } from 'express';

/**
 * Options for creating a JWT token
 */
export interface JwtTokenOptions {
  /**
   * User ID to include in claims
   */
  userId: string;
  
  /**
   * Default role (admin, user, guest)
   */
  role: string;
  
  /**
   * Array of allowed roles
   */
  allowedRoles: string[];
  
  /**
   * Tenant ID to include in claims
   */
  tenantId: string;
  
  /**
   * Username to include in the token
   */
  username: string;
  
  /**
   * Additional claims to include
   */
  customClaims?: Record<string, any>;
  
  /**
   * Secret key for signing
   */
  secret: string;
  
  /**
   * Token expiration time
   */
  expiresIn: string;
}

/**
 * JWT Hasura claims structure
 */
export interface HasuraClaims {
  'x-hasura-allowed-roles': string[];
  'x-hasura-default-role': string;
  'x-hasura-user-id': string;
  'x-hasura-tenant-id': string;
  [key: string]: any;
}

/**
 * JWT token payload structure
 */
export interface JwtTokenPayload {
  'claims.jwt.hasura.io': HasuraClaims;
  sub: string;
  name: string;
  iat: number;
  exp: number;
}

/**
 * Server instance returned by createServer
 */
export interface AuthServer {
  /**
   * Express application instance
   */
  app: Express;
  
  /**
   * Port the server is running on
   */
  port: number;
  
  /**
   * Function to close the server
   */
  close: () => void;
}

/**
 * JWT utility functions
 */
export interface JwtUtils {
  /**
   * Create a JWT token with Hasura claims
   */
  createJwtToken: (options: JwtTokenOptions) => string;
  
  /**
   * Create an admin token with full permissions
   */
  createAdminToken: (secret: string, customClaims?: Record<string, any>) => string;
  
  /**
   * Create a user token with standard permissions
   */
  createUserToken: (userId: string, tenantId: string, secret: string, customClaims?: Record<string, any>) => string;
  
  /**
   * Create a guest token with limited permissions
   */
  createGuestToken: (secret: string, customClaims?: Record<string, any>) => string;
  
  /**
   * Verify and decode a JWT token
   */
  verifyToken: (token: string, secret: string) => JwtTokenPayload;
}

/**
 * JWT utility functions object
 */
export const utils: JwtUtils;

/**
 * Express application instance
 */
export const app: Express;

/**
 * Create and start the auth server
 */
export function createServer(port?: number): AuthServer;
