import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from 'libs/common/src/dto/auth';
import { AuthDto } from 'libs/common/src/dto/auth/auth.dto';
import { CreateUserDto } from 'libs/common/src/dto/user/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface PayloadAt {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role : string[];
  isActive: boolean;
}

export interface PayloadRt {
  id: number;
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
      const isValid: boolean = await user.validatePassword(dto.password)
      if (!isValid) {
        throw new ForbiddenException(`Access denied : bad password`);
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

  async register(dto: RegisterDto): Promise<Tokens> {
    
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
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          isActive: user.isActive
        } as PayloadAt,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('EXPIRED_AT'),
        },
      ),
      this.jwtService.signAsync(
        {
          id: user.id,
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
