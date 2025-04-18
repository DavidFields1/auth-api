import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly jwtService: JwtService
	) {}

	async create(createAuthDto: CreateUserDto) {
		try {
			const { password } = createAuthDto;

			// Hash the password
			const salt = await bcrypt.genSalt();
			createAuthDto.password = await bcrypt.hash(password, salt);

			const user = this.userRepository.create(createAuthDto);
			await this.userRepository.save(user);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password: _, ...userWithoutPassword } = user;

			return {
				...userWithoutPassword,
				token: this.getJwt({ id: user.id }),
			};
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
