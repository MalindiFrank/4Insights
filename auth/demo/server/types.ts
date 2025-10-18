/**
 * Server-specific types and interfaces
 * 
 * This file contains only type definitions and interfaces
 * Implementation classes are located in the utils/ directory
 */

// Re-export shared types for convenience
export type {
  CredentialData,
  SessionData,
  AuthResponse,
  CredentialResponse,
  SessionResponse,
  CredentialStorage,
  AuthConfig,
  AuthenticatedRequest
} from '../../shared/interfaces/types.ts';
