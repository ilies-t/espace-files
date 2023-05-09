export class JwtInterface {
  // account ID (UUID)
  sub: string;

  // token creation date
  iat?: number;

  // expiration date
  exp?: number;

}