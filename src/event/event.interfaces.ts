export interface RealTimeData {
    sid: string;
    irregularEnv: EnvType[];
    environmentalData: EnvironmentalData;
}

export enum EnvType {
    temperature = 'temperature',
    humidity = 'humidity',
    windspeed = 'windspeed',
    ammonia = 'ammonia',
}

export interface EnvironmentalData {
    [EnvType.temperature]: number;
    [EnvType.humidity]: number;
    [EnvType.windspeed]: number;
    [EnvType.ammonia]: number;
}

export interface DeadChickenMapDTO {
    blocks: Block[];
}

interface Block {
    isDead: boolean;
    url?: string;
}

export interface GetWeeklyDailyDataQuery {
    sid: string;
    type: EnvType;
    dateStart: string;
    dateEnd: string;
}

export interface PostDailyInfo {
    hno: number;
    date: string;
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
}

export interface MedicineInput {
    medicineType: string;
    medicineConc: number;
}

export interface GetUnqualifiedChickenInfo {
    date: string;
    period: Period;
    hno: number;
}

export interface SubmitUnqualifiedChickenDTO {
    date: string;
    period: Period;
    hno: number;
    unqualifiedChickenInfo: UnqualifiedChickenInfo;
}

export enum Period {
    MORNING = 'MORNING',
    EVENING = 'EVENING',
}

interface UnqualifiedChickenInfo {
    amountDead: number;
    amountZleg: number;
    amountDwaft: number;
    amountSick: number;
}

export interface CreateChickenFlockDTO {
    hno: number;
    chickenFlockInfo: ChickenFlockInfo;
}

interface ChickenFlockInfo {
    dateIn: string;
    dateOut: string;
    generation: string;
    type: string;
    amountIn: number;
    gender: Gender;
}

enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

export enum Report {
    ENVIRONMENT = 'ENVIRONMENT',
    FOOD = 'FOOD',
    WATER = 'WATER',
    MEDICINE = 'MEDICINE',
    CHICKEN = 'CHICKEN',
}
