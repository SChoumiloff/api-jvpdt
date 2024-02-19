import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { StrategiesModule } from 'src/strategies/startegies.module';
@Module({
  imports: [UsersModule, StrategiesModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
