export interface User {
    userId?: any;
    username: string;
    password?: string;
    role: Role;
}

export enum Role {
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
    WORKER = 'WORKER',
}

export interface CreateUserDto {
    user: User;
    profile: Profile;
}

interface Profile {
    address: string;
    contactNumber: number;
}
