import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role, UserPayload } from '../users/users.interfaces';

import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<string[]>(
            'roles',
            context.getHandler(),
        );
        const request = context.switchToHttp().getRequest();
        const user: UserPayload = request.user;
        if (user.role === Role.OWNER) {
            return true;
        }
        return roles !== undefined && roles.indexOf(user.role) !== -1;
    }
}
