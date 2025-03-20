import {  BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.inputs';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { T } from '../../libs/types/common';


@Injectable()
export class MemberService {
  findMemberById(targetId: any): Member | PromiseLike<Member> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel("Member") private readonly memberModel: Model<Member>,
    private authService: AuthService,
    private viewService: ViewService
  ) {}

  public async signup(input: MemberInput): Promise<Member> {
    // Hash password
    input.memberPassword = await this.authService.hashPassword(input.memberPassword)
    try {
        const result = await this.memberModel.create(input); // databasega yozadi 
        // Authentication via TOKEN
        result.accessToken = await this.authService.createToken(result);
        return result
    } catch (err) {
        console.log('Error, Service.model:', err.message); // MongoDB serverdan keladigan Xato
        throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
    }
}

public async login(input: LoginInput): Promise<Member> {
  const { memberNick, memberPassword } = input;

  const response: Member = await this.memberModel
      .findOne({ memberNick: memberNick })
      .select('+memberPassword')
      .exec();

  if (!response || response.memberStatus === MemberStatus.DELETE) {
      throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
  } else if (response.memberStatus === MemberStatus.BLOCK) {
      throw new InternalServerErrorException(Message.BLOCKED_USER);
  }

  // TODO: Compare passwords
  const isMatch = await this.authService.comparePasswords(input.memberPassword, response.memberPassword)
  if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
  response.accessToken = await this.authService.createToken(response)

  return response;
}

public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
  const result: Member = await this.memberModel
    .findOneAndUpdate(
      {
        _id: memberId,
        memberStatus: MemberStatus.ACTIVE,
      },
      input,
      { new: true }
    )
    .exec();
  if (!result) throw new InternalServerErrorException(Message.UPLOAD_FAILED);
  
  // Token qayta quramiz chunki frontend uni ichidagi ma'lumotlardan foydalanamiz. Aksxolda update bulgan ma'lumotlar kurinmedi
  result.accessToken = await this.authService.createToken(result);
  return result;
}


public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
  const search = {
    _id: targetId,
    memberStatus: {
      $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
    },
  };
  const targetMember = await this.memberModel.findOne(search).exec();
  if (!targetMember) {
    throw new InternalServerErrorException(Message.NO_DATA_FOUND);
  }

  if (memberId) {
    const viewInput = {
      memberId: memberId,
      viewRefId: targetId,
      viewGroup: ViewGroup.MEMBER, 
    };
  
    const newView = await this.viewService.recordView(viewInput);
  
    if (newView) {
      await this.memberModel
        .findOneAndUpdate(
          search,
          { $inc: { memberViews: 1 } }, 
          { new: true } 
        )
        .exec();
  
      targetMember.memberViews++;
    }
  }
  

  return targetMember;
}

public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
  const { text } = input.search;
  const match: any = {
    memberType: MemberType.AGENT,
    memberStatus: MemberStatus.ACTIVE,
  };

  const sort: any = {
    [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
  };

  if (text) {
    match.memberNick = { $regex: new RegExp(text, 'i') };
  }

  console.log('match:', match);

  const result = await this.memberModel
    .aggregate([
      { $match: match },
      { $sort: sort },
      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ])
    .exec();

  console.log('result:', result);

  if (!result.length) {
    throw new InternalServerErrorException(Message.NO_DATA_FOUND);
  }

  return result[0];
}


public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
  const { memberStatus, memberType, text } = input.search;
  const match: any = {};
  const sort: any = {
    [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
  };

  if (memberStatus) match.memberStatus = memberStatus;
  if (memberType) match.memberType = memberType;
  if (text) match.memberNick = { $regex: new RegExp(text, 'i') };

  console.log('match:', match);

  const result = await this.memberModel
    .aggregate([
      { $match: match },
      { $sort: sort },
      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ])
    .exec();

  if (!result.length) {
    throw new InternalServerErrorException(Message.NO_DATA_FOUND);
  }

  return result[0];
}


public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
  const result: Member = await this.memberModel
  .findOneAndUpdate({_id: input._id}, input, {new: true})
  .exec();
  if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

  return result;
}

}
