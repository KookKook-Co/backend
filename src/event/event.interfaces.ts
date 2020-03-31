export interface RealtimeData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    ammonia: number;
}

export interface DeadChickenMapDTO {
    blocks: Block[];
}

interface Block {
    isDead: boolean;
    url?: string;
}

export interface DailyInfo {
    timestamp: Date;
    food: FoodInput;
    water: WaterInput;
    vaccine: VaccineInput;
}

interface FoodInput {
    foodIn: number;
    foodLeft: number;
}

interface WaterInput {
    waterMeter1: number;
    waterMeter2: number;
}

interface VaccineInput {
    type: string;
    concentration: number;
}

export interface SubmitUnqualifiedChickenDTO {
    date: string;
    timestamp: Date;
    period: Period;
    unqualifiedChickenInfo: UnqualifiedChickenInfo;
}

enum Period {
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
