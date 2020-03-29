import { Role } from '../users/users.interfaces';

export interface CreateUserInput {
    username: string;
    hashedPwd: string;
    isCurrentUser: boolean;
    firstName: string;
    lastName: string;
    role: string;
    imageUrl: string;
    hid: number;
}

export interface UserDataOutput {
    uid: string;
    username: string;
    hashedPwd: string;
    isCurrentUser: boolean;
    firstName: string;
    lastName: string;
    role: string;
    imageUrl: string;
    hid: number;
}

export interface LoginUserInfo {
    hno: number;
    imageUrl: string;
    role: Role;
}

export interface CreateChickenFlockInput {
    dateIn: string;
    dateOut: string;
    generation: string;
    type: string;
    amountIn: number;
    gender: string;
    hid: number;
}

export interface CreateCameraInput {
    cid: number;
    hid: number;
    xPosCam: number;
    yPosCam: number;
}

export interface CreateSensorInput {
    sid: number;
    hid: number;
    xPosSen: number;
    yPosSen: number;
}

export interface CreateChickenRecordInput {
    chicTime: string;
    period: string;
    amountDead: number;
    amountZleg: number;
    amountDwaft: number;
    amountSick: number;
    date: string;
    hid: number;
}

export interface CreateFoodRecordInput {
    foodSilo: number;
    foodIn: number;
    foodRemain: number;
    foodConsumed: number;
    timestamp: string;
    date: string;
    hid: number;
}

export interface CreateDailyDataRecordInput {
    timestamp: string;
    date: string;
    hid: number;
}

export interface CreateVacRecordInput {
    vacType: string;
    vacConc: number;
    timestamp: string;
    date: string;
    hid: number;
}

export interface CreateWaterRecordInput {
    waterMeter1: number;
    waterMeter2: number;
    waterConsumed: number;
    timestamp: string;
    date: string;
    hid: number;
}

export interface CreateEnvDataInput {
    timestamp: string;
    windspeed: number;
    ammonia: number;
    temperature: number;
    humidity: number;
    sid: number;
    hid: number;
}

export interface CreateCamImgInput {
    timestamp: string;
    url: string;
    cid: number;
    hid: number;
}

export interface LatestEnvironmentOutput {
    windspeed: number;
    ammonia: number;
    temperature: number;
    humidity: number;
}

export interface LatestUrl {
    url: string;
}

export interface SumAmountEachTypeOutput {
    SumAmountDead: number;
    SumAmountZleg: number;
    SumAmountDwaft: number;
    SumAmountSick: number;
}
export interface SumAmountChickenRecordOutput {
    hid: number;
    date: string;
    SumAmountEachType: SumAmountEachTypeOutput;
}

export interface GetChickenFlockInfoOutput {
    dateIn: string;
    dateOut: string;
    generation: string;
    type: string;
    amountIn: number;
    gender: string;
    hid: number;
}
