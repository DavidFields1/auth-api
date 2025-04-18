import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
		}),
		TypeOrmModule.forRoot({
			ssl: true,
			type: 'postgres',
			url: process.env.CONNECTION_URL,
			autoLoadEntities: true,
			synchronize: true,
		}),
		AuthModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
