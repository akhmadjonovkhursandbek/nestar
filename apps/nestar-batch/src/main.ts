import { NestFactory } from '@nestjs/core';
import { BatchModule } from './batch.module';

async function bootstrap() {
	const app = await NestFactory.create(BatchModule);
	await app.listen(process.env.PORT_BATCH ?? 3000);

	console.log(`Batch server is running on http://localhost:${process.env.PORT_BATCH ?? 3000}\n`);
}
bootstrap();
