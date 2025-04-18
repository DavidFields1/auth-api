import {
	IsEmail,
	IsEnum,
	IsString,
	Matches,
	MaxLength,
	MinLength,
	ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Providers } from '../interfaces/providers.enum';

export class CreateUserDto {
	@ApiProperty({
		description: 'User email address',
		example: 'user@example.com',
		format: 'email',
	})
	@IsString()
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'User password',
		example: 'StrongP@ss123',
		minLength: 8,
		maxLength: 30,
		pattern:
			'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
	})
	@ValidateIf(
		(obj: CreateUserDto) =>
			obj.provider === Providers.EMAIL || !obj.provider
	)
	@IsString()
	@MinLength(8)
	@MaxLength(30)
	@Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
		message:
			'password is too weak. It should contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.',
	})
	password?: string;

	@ApiProperty({
		description: 'User first name',
		example: 'John',
		minLength: 2,
	})
	@IsString()
	@MinLength(2)
	firstName: string;

	@ApiProperty({
		description: 'User last name',
		example: 'Doe',
		minLength: 2,
	})
	@IsString()
	@MinLength(2)
	lastName: string;

	@IsEnum(Providers, {
		always: true,
	})
	provider: Providers;
}
