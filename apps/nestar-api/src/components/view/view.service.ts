import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistnce(input);
		if (!viewExist) {
			console.log('- New View Insert -');
			return this.viewModel.create(input);
		} else return null;
	}

	private async checkViewExistnce(input: ViewInput): Promise<View> {
		const { memberId, viewGroup, viewRefId } = input;
		const search: T = { memberId: memberId, viewGroup: viewGroup, viewRefId: viewRefId };
		return this.viewModel.findOne(search).exec() as unknown as View;
	}
}
