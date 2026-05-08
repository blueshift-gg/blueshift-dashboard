/**
 * Base class for all authentication-related errors.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Thrown when the user rejects the signature request in their wallet.
 */
export class UserRejectedSignatureError extends AuthError {
  constructor() {
    super("User rejected the signature request.");
    this.name = "UserRejectedSignatureError";
  }
}

/**
 * Thrown when the authentication API returns an error (e.g., 401 Unauthorized).
 */
export class AuthenticationAPIError extends AuthError {
  constructor(message: string = "Authentication API request failed.") {
    super(message);
    this.name = "AuthenticationAPIError";
  }
}

/**
 * Thrown when a network error occurs (e.g., failed to fetch).
 */
export class NetworkError extends AuthError {
  constructor() {
    super("A network error occurred.");
    this.name = "NetworkError";
  }
}

/**
 * Thrown when the wallet fails to disconnect.
 */
export class WalletDisconnectError extends AuthError {
  constructor() {
    super("Failed to disconnect from the wallet.");
    this.name = "WalletDisconnectError";
  }
}

/**
 * A generic fallback error for unexpected issues.
 */
export class UnknownAuthError extends AuthError {
  constructor() {
    super("An unknown authentication error occurred.");
    this.name = "UnknownAuthError";
  }
}
