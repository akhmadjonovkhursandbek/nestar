import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowService } from './follow.service';
import { FollowResolver } from './follow.resolver';
import FollowSchema from '../../schemas/Follow.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]), AuthModule, MemberModule],
	providers: [FollowService, FollowResolver],
	exports: [FollowService],
})
export class FollowModule {}
