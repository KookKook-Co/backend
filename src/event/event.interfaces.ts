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

export interface PostDailyInfo {
    hno: number;
    date: Date;
    dailyInfo: DailyInfo;
}

interface DailyInfo {
    food: FoodInput[];
    water: WaterInput;
    medicine: MedicineInput[];
}

interface FoodInput {
    foodSilo: number;
    foodIn: number;
    foodLeft: number;
}

interface WaterInput {
    waterMeter1: number;
    waterMeter2: number;
}

interface MedicineInput {
    type: string;
    concentration: number;
}

export interface SubmitUnqualifiedChickenDTO {
    date: string;
    timestamp: Date;
    period: Period;
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

export interface ChickenFlockInfo {
    dateIn: string;
    dateOut: string;
    generation: string;
    type: string;
    amountIn: number;
    gender: string;
}
