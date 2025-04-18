import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from '../interfaces/roles';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: RolesEnum[]) => {
	return SetMetadata(META_ROLES, args);
};
