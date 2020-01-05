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
  });
});
