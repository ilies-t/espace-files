import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GeneralEnum } from '../config/general.enum';
import { JwtUtil } from '../util/jwt.util';

@Injectable()
export class AuthGuard implements CanActivate {

  // constructor
  constructor(private readonly reflector: Reflector) {}

  // method
  canActivate(context: ExecutionContext): boolean {

    // auth guard can be disabled by using `@DisableAuth()` decorator
    const isDisabled = this.reflector.get<boolean>(GeneralEnum.DISABLE_AUTH, context.getHandler());

    if (isDisabled) {
      return true;
    }

    try {
      // get a jwt from headers
      const headers = context.switchToHttp().getRequest<Request>().headers;
      const jwt = new JwtUtil().fromHeaders(headers);

      return jwt != undefined;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

}