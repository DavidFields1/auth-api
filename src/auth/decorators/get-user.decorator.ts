import {
	createParamDecorator,
	ExecutionContext,
	InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

interface Request extends Express.Request {
	user?: User;
}

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest<Request>();
	const { user } = req;

	if (!user) {
		throw new InternalServerErrorException('User not found in request');
	}

	if (data) {
		// return property or array of properties from user if data is provided
		if (typeof data == 'string') {
			return user[data as keyof User];
		}

		if (Array.isArray(data)) {
			return data.map((key) => user[key as keyof User]);
		}
	}

	return user;
});
