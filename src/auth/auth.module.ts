import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
	controllers: [AuthController],
	imports: [
		TypeOrmModule.forFeature([User]),
		ConfigModule,
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			// Use the ConfigService to get the JWT secret and expiration time
			useFactory: (configService: ConfigService) => {
				if (configService.get<string>('JWT_SECRET') === undefined) {
					throw new Error('JWT_SECRET is not defined');
				}
				if (configService.get<string>('JWT_EXPIRES_IN') === undefined) {
					throw new Error('JWT_EXPIRES_IN is not defined');
				}

				return {
					secret: configService.get<string>('JWT_SECRET'),
					signOptions: {
						expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
					},
				};
			},
		}),
	],
	providers: [AuthService, JwtStrategy],
	exports: [JwtStrategy, TypeOrmModule, PassportModule, JwtModule],
})
export class AuthModule {}
