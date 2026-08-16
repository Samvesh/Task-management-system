/**
 * Shape of the JWT payload we sign and verify.
 *
 * When a guest logs in, we create a JWT containing this payload.
 * The JwtStrategy extracts it and attaches it to `request.user`.
 *
 * Keep this lean — JWTs go in every request header, so large payloads
 * add latency. Store only what's needed for authorization decisions.
 */
export interface JwtPayload {
  /** MongoDB ObjectId of the user (as string) */
  sub: string;

  /** Whether this is a guest session */
  isGuest: boolean;
}
