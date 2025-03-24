import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { ViewModule } from './view/view.module';
import { LikeModule } from './like/like.module';
import { AuthModule } from './auth/auth.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { CommentModule } from './comment/comment.module';

// each module follows MVC pattern
@Module({
	imports: [
		MemberModule,
		AuthModule,
		PropertyModule,
		BoardArticleModule,
		LikeModule,
		ViewModule,
		CommentModule,
		FollowModule,
	],
})
export class ComponentsModule {}
