import { Reflector } from '@nestjs/core';
import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators';

@Injectable()
export class UserRoleGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const requiredRoles = this.reflector.get<string[]>(
			META_ROLES,
			context.getHandler()
		);

		const request = context.switchToHttp().getRequest<{ user: User }>();
		const user = request.user;

		if (!user || !user.isActive)
			throw new BadRequestException('Invalid user');

		if (!requiredRoles || requiredRoles.length === 0) return true;

		let hasValidRole = false;
		for (let index = 0; index < requiredRoles.length; index++) {
			if (user.roles.includes(requiredRoles[index])) {
				hasValidRole = true;
			}
		}

		if (!hasValidRole)
			throw new BadRequestException(
				`User '${user.firstName} ${user.lastName}' doesn't have a valid role. [${requiredRoles.join(', ')}]`
			);

		return true;
	}
}
