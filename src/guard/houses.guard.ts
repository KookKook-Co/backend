import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role, UserPayload } from '../users/users.interfaces';

import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class HousesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: UserPayload = request.user;
        const hno = parseInt(request.query.hno) || parseInt(request.body.hno);
        if (user.role === Role.OWNER) {
            return true;
        }
        return hno === user.hno;
    }
}
