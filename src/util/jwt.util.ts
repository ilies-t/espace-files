import { JwtService } from '@nestjs/jwt';
import { JwtInterface } from '../interface/jwt.interface';
import { GeneralEnum } from '../config/general.enum';

export class JwtUtil {

  private readonly jwt: JwtService;

  // constructor
  constructor() {
    this.jwt = new JwtService({
      signOptions: {
        algorithm: 'HS512',
        expiresIn: '10h'
      },
      secret: process.env.JWT_KEY
    });
  }

  /**
   * Generate new JWT token.
   * @param accountId Related user ID (UUID) in `sub` field.
   */
  public generate(accountId: string): string {
    return this.jwt.sign({ sub: accountId });
  }

  /**
   * Retrieve and decrypt JWT token from headers.
   * @param headers Headers instance.
   */
  public fromHeaders(headers: Headers): JwtInterface {

    // get authorization header
    let authorization = headers[GeneralEnum.HEADER_AUTHORIZATION];

    // if token does not exist in headers or does not starts with "Bearer "
    if(!authorization || !authorization.startsWith("Bearer")) {
      return null;
    }

    // get only after "Bearer "
    authorization = authorization.substring(7, authorization.length);
    return this.jwt.verify(authorization);
  }
}