import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { Properties } from '../../libs/dto/property/property';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit } from '../../libs/config';

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

	public async getVisitedProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input;
		const match: T = { viewGroup: ViewGroup.PROPERTY, memberId: memberId };

		const data = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'properties',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedProperty',
					},
				},
				{ $unwind: '$visitedProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisit,
							{ $unwind: '$visitedProperty.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.visitedProperty);

		return result;
	}
}
