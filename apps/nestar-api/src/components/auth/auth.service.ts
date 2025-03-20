import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class AuthService {

  constructor(private jwtService: JwtService) {}
  public async hashPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, salt);
  }

  public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async createToken(member: Member) : Promise<string> {
    console.log("member", member)
    const payload : T = {};
    Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
      payload[`${ele}`] = member[`${ele}`];
    });
    
    delete payload.memberPassword;
    console.log('payload:', payload);
    
    return await this.jwtService.signAsync(payload);
  }

  public async verifyToken(token: string): Promise<Member> {
    const member = await this.jwtService.verifyAsync(token) // bu yerdagi verifyAsync(token) --- yuqodira payloadga berilgan member datani oladi
    member._id = shapeIntoMongoObjectId(member._id)
    return member
  }


}
 
  