import { Test, TestingModule } from '@nestjs/testing';

import { CheckerService } from './checker.service';

describe('CheckerService', () => {
    let event: TestingModule;
    let checkerService: CheckerService;

    beforeAll(async () => {
        event = await Test.createTestingModule({
            providers: [CheckerService],
        }).compile();

        checkerService = event.get<CheckerService>(CheckerService);
    });

    describe('checkIrrTemperature', () => {
        it('regular temperature', () => {
            const testAge = 20;
            const testAgeIndex = checkerService.getAgeIndex(testAge);
            const testTemperature = 30;
            expect(
                checkerService.isIrrTemperature(testAgeIndex, testTemperature),
            ).toBe(false);
        });
        it('irregular temperature', () => {
            const testAge = 20;
            const testAgeIndex = checkerService.getAgeIndex(testAge);
            const testTemperature = 33;
            expect(
                checkerService.isIrrTemperature(testAgeIndex, testTemperature),
            ).toBe(true);
        });
    });

    describe('checkIrrHumidity', () => {
        it('regular humidity', () => {
            const testAge = 20;
            const testAgeIndex = checkerService.getAgeIndex(testAge);
            const testHumidity = 66;
            expect(
                checkerService.isIrrHumidity(testAgeIndex, testHumidity),
            ).toBe(false);
        });
        it('irregular humidity', () => {
            const testAge = 20;
            const testAgeIndex = checkerService.getAgeIndex(testAge);
            const testHumidity = 82;
            expect(
                checkerService.isIrrHumidity(testAgeIndex, testHumidity),
            ).toBe(true);
        });
    });

    describe('checkIrrWindspeed', () => {
        it('regular windspeed', () => {
            const testAge = 20;
            const testAgeIndex = checkerService.getAgeIndex(testAge);
            const testWindspeed = 1.5;
            expect(
                checkerService.isIrrWindspeed(testAgeIndex, testWindspeed),
            ).toBe(false);
        });
        it('irregular windspeed', () => {
            const testAge = 20;
            const testAgeIndex = checkerService.getAgeIndex(testAge);
            const testWindspeed = 1.3;
            expect(
                checkerService.isIrrWindspeed(testAgeIndex, testWindspeed),
            ).toBe(true);
        });
    });

    describe('checkIrrAmmonia', () => {
        it('regular ammonia', () => {
            const testAge = 20;
            const testAgeIndex = checkerService.getAgeIndex(testAge);
            const testAmmonia = 16;
            expect(checkerService.isIrrAmmonia(testAgeIndex, testAmmonia)).toBe(
                false,
            );
        });
        it('irregular ammonia', () => {
            const testAge = 20;
            const testAgeIndex = checkerService.getAgeIndex(testAge);
            const testAmmonia = 21;
            expect(checkerService.isIrrAmmonia(testAgeIndex, testAmmonia)).toBe(
                true,
            );
        });
    });
});
