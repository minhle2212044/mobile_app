import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CenterModule } from './center/center.module';
import { MaterialModule } from './material/material.module';
import { TypeModule } from './type/type.module';
import { OrderModule } from './order/order.module';
import { RewardModule } from './reward/reward.module';
import { PrismaService } from './prisma.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    UserModule,
    CenterModule,
    MaterialModule,
    TypeModule,
    OrderModule,
    RewardModule,
    CloudinaryModule
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
