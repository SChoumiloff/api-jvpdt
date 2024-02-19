import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from 'src/dto/auth/auth.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface PayloadAt {
  sub: number;
  email: string;
  firstname: string;
  lastname: string;
}

export interface PayloadRt {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UsersService,
  ) {}

  async validateUserGoogle() {}

  async login(dto: AuthDto): Promise<Tokens> {
    const user: User = await this.userService.findOneByEmail(dto.email);
    if (!user) {
      throw new ForbiddenException(`Access denied`);
    } else {
      if (!user.validatePassword(dto.password)) {
        throw new ForbiddenException(`Access denied`);
      } else {
        const tokens: Tokens = await this.getTokens(user);
        await this.userService.update(user.id, {
          refreshToken: tokens.refresh_token,
        });
        return tokens;
      }
    }
  }

  async logout(userId: number): Promise<void> {
    await this.userService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user: User = await this.userService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException(`Access denied`);
    }
    const rtMatches: boolean = await user.validateRefreshToken(refreshToken);
    if (!rtMatches) {
      throw new ForbiddenException(`Access denied`);
    }
    const tokens: Tokens = await this.getTokens(user);
    await this.userService.update(user.id, {
      refreshToken: tokens.refresh_token,
    });
    return tokens;
  }

  async register(dto: CreateUserDto): Promise<Tokens> {
    const user: User = await this.userService.create(dto);
    const tokens: Tokens = await this.getTokens(user);
    await this.userService.update(user.id, {
      refreshToken: tokens.refresh_token,
    });
    return tokens;
  }

  private async getTokens(user: User): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        } as PayloadAt,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('EXPIRED_AT'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        } as PayloadRt,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('EXPIRED_RT'),
        },
      ),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    } as Tokens;
  }
}
