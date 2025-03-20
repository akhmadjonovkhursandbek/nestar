import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[ 
    HttpModule,
    JwtModule.register({  // Json web Token orqali Authentication 
      secret: `${process.env.SECRET_TOKEN}`,
      signOptions: {expiresIn: '30d'}
    })
  ],
  providers: [AuthService],
  exports: [AuthService] // boshqa model ichida ishlatish uchun export qilindi -- member.model.ts
})
export class AuthModule {}


