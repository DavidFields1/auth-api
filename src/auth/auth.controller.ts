import {
	Controller,
	Post,
	Body,
	Get,
	UseGuards,
	Req,
	Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators';

interface Request extends Express.Request {
	user: {
		email: string;
		name: string;
	};
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	@ApiOperation({ summary: 'Create a new user account' })
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({
		status: 201,
		description: 'User created successfully',
		type: User,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request - Invalid data or email already exists',
	})
	create(@Body() createAuthDto: CreateUserDto) {
		return this.authService.create(createAuthDto);
	}

	@Post('login')
	@ApiOperation({ summary: 'Login with email and password' })
	@ApiBody({ type: LoginUserDto })
	@ApiResponse({
		status: 200,
		description: 'Login successful',
		type: User,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request - Invalid credentials',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid credentials',
	})
	login(@Body() loginUserDto: LoginUserDto) {
		return this.authService.login(loginUserDto);
	}

	@Patch('password')
	@Auth()
	updatePassword(
		@Body() updatePasswordDto: UpdatePasswordDto,
		@GetUser() user: User
	) {
		return this.authService.updatePassword(updatePasswordDto, user);
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleAuth() {
		// inicia flujo OAuth2 con Google
	}

	@Get('google/redirect')
	@UseGuards(AuthGuard('google'))
	async googleAuthRedirect(@Req() req: Request) {
		const { email, name } = req.user;
		const user = await this.authService.validateOAuthLogin(email, name);
		return {
			user,
		};
	}
}
