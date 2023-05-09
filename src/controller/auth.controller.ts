import { Body, Controller, Get, Headers, Patch, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/account/login.dto';
import { SignUpDto } from '../dto/account/sign-up.dto';
import { DisableAuth } from '../decorator/disable-auth.decorator';
import { GenericResponseDto } from '../dto/generic-response.dto';
import { MeDto } from '../dto/account/me.dto';
import { UpdateMyInfosDto } from '../dto/account/update-my-infos.dto';

@Controller('/auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @DisableAuth()
  @Post('/login')
  public async login(@Body() body: LoginDto): Promise<GenericResponseDto> {
    const result = await this.authService.login(body);
    return new GenericResponseDto(result);
  }

  @DisableAuth()
  @Post('/sign-up')
  public async signUp(@Body() body: SignUpDto): Promise<void> {
    return this.authService.signUp(body);
  }

  @Get('/me')
  public async me(@Headers() headers: Headers): Promise<MeDto> {
    return this.authService.me(headers);
  }

  @Patch('/update-my-infos')
  public async updateMyInfos(@Headers() headers: Headers, @Body() body: UpdateMyInfosDto): Promise<GenericResponseDto> {
    await this.authService.updateMyInfos(headers, body);
    return new GenericResponseDto('OK');
  }
}
