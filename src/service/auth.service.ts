import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/account/login.dto';
import { AuthRepository } from '../repository/auth.repository';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from '../dto/account/sign-up.dto';
import { JwtUtil } from '../util/jwt.util';
import { MeDto } from '../dto/account/me.dto';
import { UpdateMyInfosDto } from '../dto/account/update-my-infos.dto';
import { AccountEntity } from '../entity/account.entity';

@Injectable()
export class AuthService {

  constructor(private readonly authRepo: AuthRepository, private readonly jwt: JwtUtil) {}

  /**
   * Hash password using bcrypt.
   * @param password Clear password.
   */
  private static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 7);
  }

  /**
   * Log in user and get JWT token.
   * @param body LoginDto instance
   * @see LoginDto
   */
  public async login(body: LoginDto): Promise<string> {
    return this.authRepo.findOne({ email: body.email })
      .then(user => {
        if(user) {
          // check password
          const isSamePassword = bcrypt.compareSync(body.password, user.password_hash);
          if(isSamePassword) {
            return this.jwt.generate(user.id);
          } else {
            throw new UnauthorizedException();
          }
        } else {
          throw new UnauthorizedException();
        }
      });
  }

  /**
   * Sign up new user.
   * @param body SignUpDto instance
   * @see SignUpDto
   */
  public async signUp(body: SignUpDto): Promise<void> {
    return this.authRepo.findOne({ email: body.email })
      .then(account => {
        if(!account) {
          const hashedPassword = AuthService.hashPassword(body.password);
          this.authRepo.addAccount(body.full_name, body.email, hashedPassword);
        }
      });
  }

  /**
   * Get user basic information.
   * @param headers Request headers.
   */
  public async me(headers: Headers): Promise<MeDto> {
    const user = this.jwt.fromHeaders(headers);
    return this.authRepo.getBasicInformation(user.sub);
  }

  /**
   * Update user infos.
   * @param headers Request headers.
   * @param body UpdateMyInfosDto containing email, full name and current password.
   */
  public async updateMyInfos(headers: Headers, body: UpdateMyInfosDto): Promise<void> {
    const user = this.jwt.fromHeaders(headers);

    return this.authRepo.findOne({ id: user.sub })
      .then(async (databaseUser: AccountEntity) => {
        if(databaseUser) {
          // check password
          const isSamePassword = bcrypt.compareSync(body.current_password, databaseUser.password_hash);
          if(isSamePassword) {
            await this.authRepo.updateMyInfos(user.sub, body.email, body.full_name);
          } else {
            throw new UnauthorizedException();
          }
        } else {
          throw new UnauthorizedException();
        }
      });
  }
}
