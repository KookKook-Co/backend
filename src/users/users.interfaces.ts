export interface User {
    uid: number;
    username?: string;
    hashedPwd?: string;
    isCurrentUser?: boolean;
    firstName?: string;
    lastName?: string;
    role?: Role;
    imageUrl?: string;
}

export interface UserPayload {
    uid: number;
    hno: number;
    role: Role;
}

export enum Role {
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
    WORKER = 'WORKER',
}

export interface CreateUserDTO {
    user: UserDTO;
    hno: number;
}

interface UserDTO {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    imageUrl: string;
    lineID: string;
}
