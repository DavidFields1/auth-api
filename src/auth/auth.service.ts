import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto, UpdatePasswordDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Providers } from './interfaces/providers.enum';

type UserJwt = User & {
	token: string;
};

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly jwtService: JwtService
	) {}

	async create(createAuthDto: CreateUserDto): Promise<UserJwt> {
		try {
			if (createAuthDto.provider === Providers.EMAIL) {
				const { password } = createAuthDto;

				// Hash the password
				const salt = await bcrypt.genSalt();
				createAuthDto.password = await bcrypt.hash(password!, salt);
			}

			const user = this.userRepository.create(createAuthDto);
			await this.userRepository.save(user);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userWithoutPassword } = user;

			return {
				...userWithoutPassword,
				token: this.getJwt({ id: user.id }),
			} as UserJwt;
		} catch (error) {
			this.handleDBErrors(error);
		}
	}

	async login(loginUserDto: LoginUserDto) {
		try {
			const { email, password } = loginUserDto;

			const user = await this.userRepository.findOneBy({ email });

			if (!user) {
				throw new BadRequestException('Credentials are not valid');
			}

			if (!bcrypt.compareSync(password, user.password)) {
				throw new BadRequestException('Credentials are not valid');
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userWithoutPassword } = user;

			return {
				...userWithoutPassword,
				token: this.getJwt({ id: user.id }),
			};
		} catch (error) {
			// Handle errors
			if (error instanceof BadRequestException) {
				throw error;
			}
			this.handleDBErrors(error);
		}
	}

	async validateOAuthLogin(email: string, name: string): Promise<UserJwt> {
		let user = await this.userRepository.findOne({ where: { email } });
		if (!user) {
			const params: CreateUserDto = {
				email,
				firstName: name,
				lastName: '',
				provider: Providers.GOOGLE,
			};
			user = await this.create(params);
		}

		return {
			...user,
		} as UserJwt;
	}

	async updatePassword({ password }: UpdatePasswordDto, user: User) {
		try {
			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(password!, salt);

			await this.userRepository.update(user.id, {
				password: hashedPassword,
			});

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userData } = user;

			return {
				...userData,
			};
		} catch (error) {
			this.handleDBErrors(error);
		}
	}

	checkAuthStatus(user: User) {
		return {
			...user,
			token: this.getJwt({ id: user.id }),
		};
	}

	private getJwt(payload: JwtPayload): string {
		const token = this.jwtService.sign(payload);

		return token;
	}

	private handleDBErrors(error: any): never {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (error.code === '23505') {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			throw new BadRequestException(error.detail);
		}

		console.log(error);
		throw new InternalServerErrorException(
			'Unexpected error, check server logs'
		);
	}
}
