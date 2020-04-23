import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { FileService } from './files.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [UsersService, FileService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
