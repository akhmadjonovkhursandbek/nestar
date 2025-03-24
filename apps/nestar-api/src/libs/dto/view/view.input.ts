import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ViewGroup } from '../../enums/view.enum';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ViewInput {
	@IsNotEmpty()
	@Field(() => ViewGroup)
	viewGroup: ViewGroup;

	@IsNotEmpty()
	@Field(() => String)
	viewRefId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;
}
