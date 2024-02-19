import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AccessTokenStrategy } from './accessToken.strategy';
import { refreshTokenStrategy } from './refreshToken.strategy';

@Module({
  imports: [UsersModule],
  exports: [AccessTokenStrategy, refreshTokenStrategy],
  providers: [AccessTokenStrategy, refreshTokenStrategy],
})
export class StrategiesModule {}
