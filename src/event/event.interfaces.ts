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

export interface DailyInfoDTO {
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
