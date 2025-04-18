import {
	IsEmail,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
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
	@IsString()
	@MinLength(8)
	@MaxLength(30)
	@Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
		message:
			'password is too weak. It should contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.',
	})
	password: string;
}
