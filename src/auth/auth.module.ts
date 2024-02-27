import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { StrategiesModule } from 'src/strategies/startegies.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
@Module({
  imports: [UsersModule, StrategiesModule],
  providers: [AuthService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }
  ],
  controllers: [AuthController],
})
export class AuthModule {}
