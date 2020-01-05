import { zValidations, ZValidations } from './z-validations';
import { ETradeType } from './models';

describe('ZValidations', () => {
  const zValidationsMock: ZValidations = zValidations;

  beforeEach(() => {
    // zValidationsMock = zValidations;
  });

  describe('validate', () => {
    const testData = {
      deposit: 1000,
      risk: 0.01,
      leverage: {
        allow: true,
        max: 5,
      },
      tradeType: ETradeType.Long,
      breakeven: {
        fee: 0.001,
      },
      entries: [
        {
          price: 100,
          volumePart: 1,
          fee: 0.002,
        },
      ],
      stops: [
        {
          price: 90,
          volumePart: 1,
          fee: 0.001,
        },
      ],
      takes: [
        {
          price: 150,
          volumePart: 1,
          fee: 0.002,
        },
      ],
      maxTradeVolumeQuoted: 5000,
    };

    it('should pass validation', () => {
      expect(zValidationsMock.validate(testData)).to.equal(undefined);
    });

    describe('Common section', () => {
      describe('deposit field', () => {
        it(`WHEN: send data with wrong value in deposit field
            THEN: should return validation error`, () => {
          const testData = {
            deposit: -1,
            risk: 0.01,
            leverage: {
              allow: true,
              max: 5,
            },
            tradeType: ETradeType.Long,
            breakeven: {
              fee: 0.001,
            },
            entries: [
              {
                price: 100,
                volumePart: 1,
                fee: 0.002,
              },
            ],
            stops: [
              {
                price: 90,
                volumePart: 1,
                fee: 0.001,
              },
            ],
            takes: [
              {
                price: 150,
                volumePart: 1,
                fee: 0.002,
              },
            ],
            maxTradeVolumeQuoted: 5000,
          };
          expect(zValidationsMock.validate(testData)).to.eql(
            { deposit: { message: 'Value should be more then -1.', actual: -1 } }
          );
        });
      });

      describe('risk field', () => {
        it(`WHEN: send valid data
            THEN: should pass validation`, () => {
          const testData = {
            deposit: 100,
            risk: 0.01,
            leverage: {
              allow: true,
              max: 5,
            },
            tradeType: ETradeType.Long,
            breakeven: {
              fee: 0.001,
            },
            entries: [
              {
                price: 100,
                volumePart: 1,
                fee: 0.002,
              },
            ],
            stops: [
              {
                price: 90,
                volumePart: 1,
                fee: 0.001,
              },
            ],
            takes: [
              {
                price: 150,
                volumePart: 1,
                fee: 0.002,
              },
            ],
            maxTradeVolumeQuoted: 5000,
          };
          const riskRangeValidValue = [0, 0.01, 0.05, 0.1];

          riskRangeValidValue.forEach((value) => {
            testData.risk = value;
            expect(zValidationsMock.validate(testData)).to.equal(undefined);
          });
        });

        it(`WHEN: send less than minimum value
            THEN: should return validation error`, () => {
          const testData = {
            deposit: 100,
            risk: -0.01,
            leverage: {
              allow: true,
              max: 5,
            },
            tradeType: ETradeType.Long,
            breakeven: {
              fee: 0.001,
            },
            entries: [
              {
                price: 100,
                volumePart: 1,
                fee: 0.002,
              },
            ],
            stops: [
              {
                price: 90,
                volumePart: 1,
                fee: 0.001,
              },
            ],
            takes: [
              {
                price: 150,
                volumePart: 1,
                fee: 0.002,
              },
            ],
            maxTradeVolumeQuoted: 5000,
          };

          expect(zValidationsMock.validate(testData)).to.eql(
            { risk: { message: `Value should be more then -0.01.`, actual: -0.01 } }
          );
        });

        it(`WHEN: send more than max value
            THEN: should return validation error`, () => {
          const testData = {
            deposit: 100,
            risk: 0.2,
            leverage: {
              allow: true,
              max: 5,
            },
            tradeType: ETradeType.Long,
            breakeven: {
              fee: 0.001,
            },
            entries: [
              {
                price: 100,
                volumePart: 1,
                fee: 0.002,
              },
            ],
            stops: [
              {
                price: 90,
                volumePart: 1,
                fee: 0.001,
              },
            ],
            takes: [
              {
                price: 150,
                volumePart: 1,
                fee: 0.002,
              },
            ],
            maxTradeVolumeQuoted: 5000,
          };

          expect(zValidationsMock.validate(testData)).to.eql(
            { risk: { message: `Value should be less then 0.2.`, actual: 0.2 } }
          );
        });
      });
    });
  });
});
