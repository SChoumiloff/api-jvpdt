import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService, Tokens } from './auth.service';
import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from 'libs/common/src/decorators';
import { AuthDto } from 'src/dto/auth/auth.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AccessTokenGuard, RefreshTokenGuard } from 'libs/common/src/guards';
import { Request } from 'express';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthDto): Promise<Tokens> {
    return await this.authService.login(dto);
  }

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto): Promise<Tokens> {
    return await this.authService.register(dto);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async logout(@GetCurrentUserId() userId: number) {
    return await this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUserId() userId: number,
  ) {
    return await this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() request: Request) {
    return request.user;
  }
}
