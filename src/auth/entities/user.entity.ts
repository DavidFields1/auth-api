import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { RolesEnum } from '../interfaces/roles';
import { ApiProperty } from '@nestjs/swagger';
import { Providers } from '../interfaces/providers.enum';

@Entity('users')
export class User {
	@ApiProperty({
		description: 'User ID',
		example: '1',
		readOnly: true,
	})
	@PrimaryGeneratedColumn('increment')
	id: string;

	@ApiProperty({
		description: 'User email address',
		example: 'user@example.com',
		format: 'email',
		uniqueItems: true,
	})
	@Column('text', { unique: true })
	email: string;

	@ApiProperty({
		description: 'User password (hashed)',
		example: '$2b$10$X7UrE2J...',
		writeOnly: true,
	})
	@Column('text', { nullable: true })
	password: string;

	@ApiProperty({
		description: 'User first name',
		example: 'John',
		minLength: 2,
	})
	@Column('text')
	firstName: string;

	@ApiProperty({
		description: 'User last name',
		example: 'Doe',
		minLength: 2,
	})
	@Column('text')
	lastName: string;

	@ApiProperty({
		description: 'Whether the user account is active',
		example: true,
		default: true,
	})
	@Column('bool', {
		default: true,
	})
	isActive: boolean;

	@ApiProperty({
		description: 'User roles',
		example: ['user'],
		enum: RolesEnum,
		isArray: true,
		default: [RolesEnum.USER],
	})
	@Column({
		type: 'enum',
		enum: RolesEnum,
		array: true,
		default: [RolesEnum.USER],
	})
	roles: string[];

	@Column({
		type: 'enum',
		enum: Providers,
		default: Providers.EMAIL,
	})
	provider: string;

	@BeforeInsert()
	verifyEmail() {
		this.email = this.email.toLowerCase().trim();
	}

	@BeforeUpdate()
	verifyEmailOnUpdate() {
		this.verifyEmail();
	}
}
