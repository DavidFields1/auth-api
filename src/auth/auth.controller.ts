import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser, GetRawHeaders, RoleProtected } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { RolesEnum } from './interfaces/roles';
import { Auth } from './decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

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

	@Get('status')
	@ApiOperation({ summary: 'Check authentication status' })
	@ApiResponse({
		status: 200,
		description: 'Authentication status checked successfully',
		type: User,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
	})
	checkAuthStatus(@GetUser() user: User) {
		return this.authService.checkAuthStatus(user);
	}

	@Get('test-auth')
	@ApiOperation({ summary: 'Test authentication (Development only)' })
	@ApiResponse({
		status: 200,
		description: 'Authentication test successful',
		schema: {
			type: 'object',
			properties: {
				ok: { type: 'boolean' },
				message: { type: 'string' },
				user: { type: 'object' },
				userEmail: { type: 'string' },
				userIdAndEmail: { type: 'array', items: { type: 'string' } },
				rawHeaders: { type: 'array', items: { type: 'string' } },
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
	})
	@UseGuards(AuthGuard())
	checkStatus(
		@GetUser() user: User,
		@GetUser('email') userEmail: string,
		@GetUser(['id', 'email']) userIdAndEmail: string[],
		@GetRawHeaders() rawHeaders: string[]
	) {
		return {
			ok: true,
			message: 'Authenticated',
			user,
			userEmail,
			userIdAndEmail,
			rawHeaders,
		};
	}

	@Get('test-roles')
	@ApiOperation({
		summary: 'Test role-based authentication (Development only)',
	})
	@ApiResponse({
		status: 200,
		description: 'Role test successful',
		schema: {
			type: 'object',
			properties: {
				ok: { type: 'boolean' },
				message: { type: 'string' },
				user: { type: 'object' },
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - User does not have required role',
	})
	@RoleProtected(RolesEnum.ADMIN)
	@UseGuards(AuthGuard(), UserRoleGuard)
	checkRoles(@GetUser() user: User) {
		return {
			ok: true,
			message: 'Authenticated',
			user,
		};
	}

	@Get('test-decorator')
	@ApiOperation({ summary: 'Test custom auth decorator (Development only)' })
	@ApiResponse({
		status: 200,
		description: 'Decorator test successful',
		schema: {
			type: 'object',
			properties: {
				ok: { type: 'boolean' },
				message: { type: 'string' },
				user: { type: 'object' },
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - User does not have required role',
	})
	@Auth(RolesEnum.ADMIN, RolesEnum.USER)
	checkRolesDecorator(@GetUser() user: User) {
		return {
			ok: true,
			message: 'Authenticated',
			user,
		};
	}
}
