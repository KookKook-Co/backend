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
    hid: any;
}
export interface UserInput {
    username: string;
    firstName: string;
    lastName: string;
    lineID: string;
    role: Role;
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

export interface ChickenFlockUpdate {
    dateIn: string;
    dateOut: string;
    type: string;
    amountIn: number;
    gender: string;
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

export interface CreateMedicineRecordInput {
    medicineType: string;
    medicineConc: number;
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

export interface MedicineRecord {
    medicineType: string;
    medicineConc: number;
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

export interface MaxAndMin {
    date: Date;
    max: number;
    min: number;
}

export interface MaxAndMinTemperature {
    date: Date;
    maxTemperature: number;
    minTemperature: number;
}
export interface MaxAndMinHumidity {
    date: Date;
    maxHumidity: number;
    minHumidity: number;
}
export interface MaxAndMinAmmonia {
    date: Date;
    maxAmmonia: number;
    minAmmonia: number;
}
export interface MaxAndMinWindSpeed {
    date: Date;
    maxWindSpeed: number;
    minWindSpeed: number;
}

export interface DailyDataRecordSet {
    food: Array<FoodRecord>;
    medicine: MedicineRecord;
    water: WaterRecord;
}

export interface DailySetRecordInput {
    hid: number;
    date: string;
    timestamp: string;
    dailyInfo: DailyInfo;
}

export interface DailyInfo {
    food: FoodInput[];
    water: WaterInput;
    medicine: MedicineInput[];
}

export interface FoodInput {
    foodSilo: number;
    foodIn: number;
    foodRemain: number;
    foodConsumed: number;
}

export interface WaterInput {
    waterMeter1: number;
    waterMeter2: number;
    waterConsumed: number;
}

export interface MedicineInput {
    medicineType: string;
    medicineConc: number;
}

export interface EnvironmentalDataReport {
    hid: number;
    generation: string;
    timestamp: Date;
    windspeed: number;
    ammonia: number;
    temperature: number;
    humidity: number;
}

export interface FoodConsumptionReport {
    hid: number;
    generation: string;
    timestamp: Date;
    foodSilo: number;
    foodIn: number;
    foodRemain: number;
    foodConsumed: number;
}

export interface WaterConsumptionReport {
    hid: number;
    generation: string;
    timestamp: Date;
    waterMeter1: number;
    waterMeter2: number;
    waterConsumed: number;
}

export interface MedicineConsumptionReport {
    hid: number;
    generation: string;
    timestamp: Date;
    medicineType: string;
    medicineConc: number;
}

export interface DeadChickenReport {
    hid: number;
    generation: string;
    date: string;
    chicTime: string;
    period: string;
    amountDead: number;
    amountZleg: number;
    amountDwaft: number;
    amountSick: number;
}
