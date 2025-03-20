import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.inputs';

@Injectable()
export class ViewService {
  constructor(
    @InjectModel('View') private readonly viewModel: Model<View>,
  ) {}

  public async recordView(input: ViewInput): Promise<View | null> {
    const viewExist = await this.checkViewExistence(input);
    if (!viewExist) {
      console.log('- New View Insert -');
      return await this.viewModel.create(input);
    } else {
      return null;
    }
  }

  private async checkViewExistence(input: ViewInput): Promise<View | null> {
    const { memberId, viewRefId } = input;
    const search = { memberId, viewRefId };
    return await this.viewModel.findOne(search).exec();
  }
}
