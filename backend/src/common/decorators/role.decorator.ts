import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => Reflector.createDecorator<string[]>()({ roles });

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
