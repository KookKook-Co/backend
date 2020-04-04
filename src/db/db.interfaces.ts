import { Role } from '../users/users.interfaces';

export interface CreateUserInput {
    username: string;
    hashedPwd: string;
    isCurrentUser: boolean;
    firstName: string;
    lastName: string;
    lineID: string;
    role: Role;
    imageUrl: string;
    hid: number;
}

export interface UserDataOutput {
    uid: number;
    username: string;
    hashedPwd: string;
    isCurrentUser: boolean;
    firstName: string;
    lastName: string;
    role: Role;
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
    cid: string;
    cno: number;
    hid: number;
    xPosCam: number;
    yPosCam: number;
}

export interface CreateSensorInput {
    sid: string;
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
    sid: string;
}

export interface CreateCamImgInput {
    timestamp: string;
    url: string;
    amountDead: number;
    cid: string;
}

export interface LatestUrl {
    url: string;
}

export interface ChickenFlockInfoOutput {
    dateIn: Date;
    dateOut: Date;
    generation: string;
    type: string;
    amountIn: number;
    gender: string;
    hid: number;
}

export interface EnvironmentInfoOutput {
    windspeed: number;
    ammonia: number;
    temperature: number;
    humidity: number;
}

export interface EnvironmentInfoSetOutput {
    timestamp: Date;
    windspeed: number;
    ammonia: number;
    temperature: number;
    humidity: number;
}

export interface EnvironmentInfoSetAndSidOutput {
    sid: string;
    timestamp: Date;
    windspeed: number;
    ammonia: number;
    temperature: number;
    humidity: number;
}

export interface LastImageForEachCameraOutput {
    cid: string;
    xPosCam: number;
    yPosCam: number;
    url: string;
    amountDead: number;
}

export interface UpdateFoodRecordInput {
    timestamp: string;
    date: string;
    hid: number;
    newfoodSilo: number;
    newfoodIn: number;
    newfoodRemain: number;
    newfoodConsumed: number;
}

export interface HouseOutput {
    hid: number;
    length: number;
    width: number;
    scale: number;
}

export interface SensorOutput {
    sid: string;
    xPosSen: number;
    yPosSen: number;
}

export interface CameraOutput {
    cid: string;
    cno: number;
    hid: number;
    xPosCam: number;
    yPosCam: number;
}

export interface ChickenRecord {
    chicTime: Date;
    period: string;
    amountDead: number;
    amountZleg: number;
    amountDwaft: number;
    amountSick: number;
    date: Date;
    hid: number;
}

export interface FoodRecord {
    foodSilo: number;
    foodIn: number;
    foodRemain: number;
    foodConsumed: number;
    timestamp: Date;
    date: Date;
    hid: number;
}

export interface VacRecord {
    vacType: string;
    vacConc: number;
    timestamp: Date;
    date: Date;
    hid: number;
}

export interface WaterRecord {
    waterMeter1: number;
    waterMeter2: number;
    waterConsumed: number;
    timestamp: Date;
    date: Date;
    hid: number;
}

export interface TemperatureTimestamp {
    timestamp: Date;
    temperature: number;
}

export interface HumidityTimestamp {
    timestamp: Date;
    humidity: number;
}

export interface AmmoniaTimestamp {
    timestamp: Date;
    ammonia: number;
}

export interface WindspeedTimestamp {
    timestamp: Date;
    windspeed: number;
}

export interface MaxAndMinTemperature {
    date: Date;
    maxTemperature: number;
    minTemperature: number;
}
