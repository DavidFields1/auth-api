import { applyDecorators, UseGuards } from '@nestjs/common';
import { RolesEnum } from '../interfaces/roles';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...roles: RolesEnum[]) {
	return applyDecorators(
		RoleProtected(...roles),
		UseGuards(AuthGuard(), UserRoleGuard)
	);
}
