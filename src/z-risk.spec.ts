// tslint:disable:no-unused-expression
import { TradeInfoArgs, TradeOrderArg, ZRisk } from './z-risk';
import { zMath } from './z-math';

describe('ZRisk', () => {
  let zRisk: ZRisk;

  beforeEach(() => {
    zRisk = new ZRisk(zMath);
  });

  describe('getTradeInfo()', () => {
    it('should calculate Long trade type', () => {
      // arrange
      const args: TradeInfoArgs = {
        entries: [
          { price: 8000, volumePart: .25, fee: 0.001 },
          { price: 7500, volumePart: .25, fee: 0.002 },
          { price: 7000, volumePart: .5,  fee: 0.001 },
        ],
        stops: [
          { price: 6900, volumePart: .5,  fee: 0.00 },
          { price: 6800, volumePart: .25, fee: 0.00 },
          { price: 6500, volumePart: .25, fee: 0.00 },
        ],
        takes: [
          { price: 9000, volumePart: .25, fee: 0.002 },
          { price: 9250, volumePart: .1,  fee: 0.001 },
          { price: 9500, volumePart: .15, fee: 0.002 },
          { price: 9900, volumePart: .5,  fee: 0.001 },
        ],
        deposit: 100 * 1000,
        risk: .01, // 1%
      };
      const vRiskExpected = args.deposit * args.risk;  /* ? */

      // act
      const { entries, stops, takes, totalVolume } = zRisk.getTradeInfo(args);  /* ? */

      // assert
      const vTotalLossQuoted = totalVolume.entries.orders.quoted
                             - totalVolume.stops.orders.quoted
                             + totalVolume.entries.fees.quoted
                             + totalVolume.stops.fees.quoted; /* ? */
      expect(vTotalLossQuoted).to.floatEq(totalVolume.lossQuoted);

      const vTotalProfitQuoted = totalVolume.takes.orders.quoted
                               - totalVolume.entries.orders.quoted
                               - totalVolume.takes.fees.quoted
                               - totalVolume.entries.fees.quoted;  /* ? */
      expect(vTotalProfitQuoted).to.floatEq(totalVolume.profitQuoted);

      const vLostRounded = zMath.round(totalVolume.lossQuoted, 10);  /* ? */
      expect(vLostRounded).to.floatEq(vRiskExpected);
    });
  });

});
