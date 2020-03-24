export interface UserDataInput {
    username: string;
    hashedPwd: string;
    isCurrentUser: number;
    firstName: string;
    lastName: string;
    role: string;
    imgUrl: string;
    hid: number;
}

export interface ChickenInput {
    dateIn: string;
    dateOut: string;
    generation: string;
    type: string;
    amountIn: number;
    gender: string;
    hid: number;
}

export interface SensorInput {
    sid: number;
    hid: number;
    sen_x: number;
    sen_y: number;
}

export interface ChickenRecordInput {
    chicTime: string;
    amountDead: number;
    amountZleg: number;
    amountDwaft: number;
    amountSick: number;
    date: string;
    hid: number;
}

export interface FoodRecordInput {
    foodSilo: number;
    foodIn: number;
    foodRemain: number;
    foodConsumed: number;
    timestamp: string;
    date: string;
    hid: number;
}

export interface DailyDataRecordInput {
    timestamp: string;
    date: string;
    hid: number;
}

export interface VacRecordInput {
    vacType: string;
    vacConc: number;
    timestamp: string;
    date: string;
    hid: number;
}

export interface WaterRecordInput {
    waterMeter1: number;
    waterMeter2: number;
    waterConsumed: number;
    timestamp: string;
    date: string;
    hid: number;
}

export interface EnvironmentInput {
    timestamp: string;
    windspeed: number;
    ammonia: number;
    temperature: number;
    humidity: number;
    sid: number;
    hid: number;
}

export interface ImageInput {
    timestamp: string;
    url: string;
    cid: number;
    hid: number;
}
