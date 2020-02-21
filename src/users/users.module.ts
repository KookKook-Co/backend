import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../../src/auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
