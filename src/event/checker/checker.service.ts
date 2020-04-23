import { EnvType, EnvironmentalData } from '../event.interfaces';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckerService {
    private readonly ageRange = [4, 8, 15, 22, 29];
    private readonly normalMinTemperature = [
        23.3,
        24.4,
        25.6,
        26.7,
        27.8,
        28.9,
    ];
    private readonly normalMaxTemperature = [29.4, 30.6, 31.7, 32.8, 33.9, 35];
    private readonly normalHumidity = [50, 80];
    private readonly windspeed = [0.3, 1.5];
    private readonly ammonia = 20;

    isIrrTemperature = (ageIndex, temperature) =>
        temperature < this.normalMinTemperature[ageIndex] ||
        temperature > this.normalMaxTemperature[ageIndex];

    isIrrHumidity = (ageIndex, humidity) =>
        humidity < this.normalHumidity[0] || humidity > this.normalHumidity[1];

    isIrrWindspeed = (ageIndex, windspeed) => {
        if (ageIndex < 3) {
            return (
                windspeed < this.windspeed[0] - 0.05 ||
                windspeed > this.windspeed[0] + 0.05
            );
        } else {
            return (
                windspeed < this.windspeed[1] - 0.05 ||
                windspeed > this.windspeed[1] + 0.05
            );
        }
    };

    isIrrAmmonia = (ageIndex, ammonia) => ammonia > this.ammonia;

    private readonly checkList = {
        [EnvType.temperature]: this.isIrrTemperature,
        [EnvType.humidity]: this.isIrrHumidity,
        [EnvType.windspeed]: this.isIrrWindspeed,
        [EnvType.ammonia]: this.isIrrAmmonia,
    };

    getAgeIndex = (age: number) => {
        let ageIndex = 0;
        for (ageIndex = 0; ageIndex < this.ageRange.length; ageIndex++) {
            if (age < this.ageRange[ageIndex]) {
                break;
            }
        }
        return ageIndex;
    };

    getIrrEnv(age: number, envData: EnvironmentalData) {
        const irrEnv: EnvType[] = [];

        const ageIndex = this.getAgeIndex(age);

        // console.log(`ageIndex: ${ageIndex}`);

        Object.keys(envData).map(each => {
            const check = this.checkList[each](ageIndex, envData[each]);
            // console.log(`check: ${check}`);

            if (check) {
                irrEnv.push(each as EnvType);
            }
            // console.log(`irrEnv: ${irrEnv}`);
        });

        return irrEnv;
    }

    isIrrEnv(age: number, type: EnvType, value: number) {
        return this.checkList[type](this.getAgeIndex(age), value);
    }
}
