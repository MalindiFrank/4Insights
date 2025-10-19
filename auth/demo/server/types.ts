/**
 * Server-specific types and interfaces
 *
 * This file contains only type definitions and interfaces
 * Implementation classes are located in the utils/ directory
 */

// Re-export shared types for convenience
export type {
  AuthConfig,
  AuthenticatedRequest,
  AuthResponse,
  CredentialData,
  CredentialResponse,
  CredentialStorage,
  SessionData,
  SessionResponse,
} from "../../shared/interfaces/types.ts";
