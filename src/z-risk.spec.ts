// tslint:disable:no-unused-expression
/* tslint:disable:space-in-parens */
import { ETradeType, TotalVolumeInfo, TradeInfoArgs, TradeVolumeInfoArgs, ZRisk } from './z-risk';
import { zMath } from './z-math';

describe('ZRisk', () => {
  let zRisk: ZRisk;

  beforeEach(() => {
    zRisk = new ZRisk(zMath);
  });

  describe('#getTradeInfo()', () => {

    describe('Long trade', () => {
      const commonInfo = {
        tradeType: ETradeType.Long,
        deposit: 100 * 1000,
        risk: .01, // 1%
        maxTradeVolumeQuoted: 100000,
        leverage: {
          allow: true,
          maxTimes: 3,
        },
      };
      runLongIt(
        'should calculate Long trade type with multiple orders',
        {
          ...commonInfo,
          entries: [
            { price: 8000, volumePart: .25, fee: 0.001 },
            { price: 7500, volumePart: .25, fee: 0.002 },
            { price: 7000, volumePart: .5,  fee: 0.001 },
          ],
          stops:   [
            { price: 6900, volumePart: .5,  fee: 0.002 },
            { price: 6800, volumePart: .25, fee: 0.002 },
            { price: 6500, volumePart: .25, fee: 0.002 },
          ],
          takes:   [
            { price: 9000, volumePart: .25, fee: 0.002 },
            { price: 9250, volumePart: .1,  fee: 0.001 },
            { price: 9500, volumePart: .15, fee: 0.002 },
            { price: 9900, volumePart: .5,  fee: 0.001 },
          ],
        },
      );

      runLongIt(
        'should calculate Long trade type with One order',
        {
          ...commonInfo,
          entries: [
            { price: 8000, volumePart: 1, fee: 0.001 },
          ],
          stops:   [
            { price: 7900, volumePart: 1,  fee: 0.002 },
          ],
          takes:   [
            { price: 9000, volumePart: 1, fee: 0.002 },
          ],
        },
      );

      runLongIt(
        'should calculate Long trade type with 0 fees',
        {
          ...commonInfo,
          entries: [
            { price: 8000, volumePart: .25, fee: 0 },
            { price: 7500, volumePart: .75, fee: 0 },
          ],
          stops:   [
            { price: 7400, volumePart: .75, fee: 0 },
            { price: 7000, volumePart: .25, fee: 0 },
          ],
          takes:   [
            { price: 9000, volumePart: .25, fee: 0 },
            { price: 9500, volumePart: .75, fee: 0 },
          ],
        },
      );

      runLongIt(
        'should calculate Long trade type with Large fees',
        {
          ...commonInfo,
          entries: [
            { price: 7000, volumePart: .25, fee: 0.1 },
            { price: 6000, volumePart: .75, fee: 0.2 },
          ],
          stops:   [
            { price: 5900, volumePart: .75, fee: 0.1 },
            { price: 5800, volumePart: .25, fee: 0.2 },
          ],
          takes:   [
            { price: 9000, volumePart: .25, fee: 0.1 },
            { price: 9500, volumePart: .75, fee: 0.2 },
          ],
        },
      );

      it('should calculate Long trade with one order and manual orders calculation', () => {
        // arrange
        const args = {
          ...commonInfo,
          entries: [
            { price: 10000, volumePart: 1, fee: 0 },
          ],
          stops:   [
            { price: 9000, volumePart: 1, fee: 0 },
          ],
          takes:   [
            { price: 15000, volumePart: 1, fee: 0 },
          ],
        };
        const vRiskExpected = args.deposit * args.risk;  /* ? */

        // act
        const { entries, stops, takes, totalVolume } = zRisk.getTradeInfo(args);  /* ? */

        // assert

        // check orders volume quoted
        expect(entries[0].volumeQuoted /* ? */).to.roundEq(10000);
        expect(stops[0].volumeQuoted /* ? */).to.roundEq(9000);
        expect(takes[0].volumeQuoted /* ? */).to.roundEq(15000);

        // check that orders base volume equals
        expect(entries[0].volumeBase /* ? */).to.roundEq(1);
        expect(entries[0].volumeBase).to.roundEq(stops[0].volumeBase);
        expect(entries[0].volumeBase).to.roundEq(takes[0].volumeBase);

        // check all fees is zero
        expect(entries[0].feeVolumeBase).to.equal(0);
        expect(entries[0].feeVolumeQuoted).to.equal(0);
        expect(stops[0].feeVolumeBase).to.equal(0);
        expect(stops[0].feeVolumeQuoted).to.equal(0);
        expect(takes[0].feeVolumeBase).to.equal(0);
        expect(takes[0].feeVolumeQuoted).to.equal(0);

        // the main assertion
        expect(totalVolume.lossQuoted /* ? */).to.roundEq(vRiskExpected);
      });

      function runLongIt(message: string, args: TradeInfoArgs) {
        it(message, () => {
          // arrange
          const vRiskExpected = args.deposit * args.risk;  /* ? */

          // act
          const { totalVolume } = zRisk.getTradeInfo(args);  /* ? */

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

          totalVolumeZeroCheck(totalVolume);

          // the main assertion
          expect(totalVolume.lossQuoted /* ? */).to.roundEq(vRiskExpected);
        });
      }

    }); // end Long Trade describe()

    describe('Short trade', () => {

      const commonShortInfo = {
        tradeType: ETradeType.Short,
        deposit: 100 * 1000,
        risk: .01, // 1%
        maxTradeVolumeQuoted: 100000,
        leverage: {
          allow: true,
          maxTimes: 3,
        },
      };

      runShortIt(
        'should calculate Short trade type with multiple orders',
        {
          ...commonShortInfo,
          entries: [
            { price: 8000, volumePart: .25, fee: 0.001 },
            { price: 7500, volumePart: .25, fee: 0.002 },
            { price: 7000, volumePart: .5,  fee: 0.001 },
          ],
          stops:   [
            { price: 8100, volumePart: .5,  fee: 0.002 },
            { price: 8200, volumePart: .25, fee: 0.002 },
            { price: 8500, volumePart: .25, fee: 0.002 },
          ],
          takes:   [
            { price: 5000, volumePart: .25, fee: 0.002 },
            { price: 5250, volumePart: .1,  fee: 0.001 },
            { price: 5500, volumePart: .15, fee: 0.002 },
            { price: 5900, volumePart: .5,  fee: 0.001 },
          ],
        },
      );

      runShortIt(
        'should calculate Short trade type with One order',
        {
          ...commonShortInfo,
          entries: [
            { price: 8000, volumePart: 1, fee: 0.001 },
          ],
          stops:   [
            { price: 8100, volumePart: 1,  fee: 0.002 },
          ],
          takes:   [
            { price: 7000, volumePart: 1, fee: 0.002 },
          ],
        },
      );

      runShortIt(
        'should calculate Short trade type with 0 fees',
        {
          ...commonShortInfo,
          entries: [
            { price: 8000, volumePart: .25, fee: 0 },
            { price: 7500, volumePart: .75, fee: 0 },
          ],
          stops:   [
            { price: 8100, volumePart: .75,  fee: 0 },
            { price: 8200, volumePart: .25, fee: 0 },
          ],
          takes:   [
            { price: 5000, volumePart: .25, fee: 0 },
            { price: 5250, volumePart: .75, fee: 0 },
          ],
        },
      );

      runShortIt(
        'should calculate Short trade type with Large fees',
        {
          ...commonShortInfo,
          entries: [
            { price: 8000, volumePart: .25, fee: 0.1 },
            { price: 7500, volumePart: .75, fee: 0.2 },
          ],
          stops:   [
            { price: 8100, volumePart: .75, fee: 0.1 },
            { price: 8200, volumePart: .25, fee: 0.2 },
          ],
          takes:   [
            { price: 4000, volumePart: .25, fee: 0.1 },
            { price: 5250, volumePart: .75, fee: 0.2 },
          ],
        },
      );

      it('should calculate Long trade with one order and manual orders calculation', () => {
        // arrange
        const args = {
          ...commonShortInfo,
          entries: [
            { price: 10000, volumePart: 1, fee: 0 },
          ],
          stops:   [
            { price: 11000, volumePart: 1, fee: 0 },
          ],
          takes:   [
            { price: 5000, volumePart: 1, fee: 0 },
          ],
        };
        const vRiskExpected = args.deposit * args.risk;  /* ? */

        // act
        const { entries, stops, takes, totalVolume } = zRisk.getTradeInfo(args);  /* ? */

        // assert

        // check orders volume base
        expect(entries[0].volumeBase /* ? */).to.roundEq(1);
        expect(stops[0].volumeBase /* ? */).to.roundEq(10000 / 11000);
        expect(takes[0].volumeBase /* ? */).to.roundEq(10000 / 5000);

        // check that orders base volume equals
        expect(entries[0].volumeQuoted /* ? */).to.roundEq(10000);
        expect(entries[0].volumeQuoted /* ? */).to.roundEq(stops[0].volumeQuoted);
        expect(entries[0].volumeQuoted /* ? */).to.roundEq(takes[0].volumeQuoted);

        // check all fees is zero
        expect(entries[0].feeVolumeBase).to.equal(0);
        expect(entries[0].feeVolumeQuoted).to.equal(0);
        expect(stops[0].feeVolumeBase).to.equal(0);
        expect(stops[0].feeVolumeQuoted).to.equal(0);
        expect(takes[0].feeVolumeBase).to.equal(0);
        expect(takes[0].feeVolumeQuoted).to.equal(0);

        // the main assertion
        expect(totalVolume.lossQuoted /* ? */).to.roundEq(vRiskExpected);
      });

      function runShortIt(message: string, args: TradeInfoArgs) {
        it(message, () => {
          // arrange
          const vRiskExpected = args.deposit * args.risk;  /* ? */
          const pAvgStop = 1 / zMath.sumBy(args.stops, v => v.volumePart / v.price);
          const pAvgTake = 1 / zMath.sumBy(args.takes, v => v.volumePart / v.price);

          // act
          const { totalVolume } = zRisk.getTradeInfo(args);  /* ? */

          // assert
          const vTotalLossQuoted = (totalVolume.entries.orders.base - totalVolume.stops.orders.base)
                                 * pAvgStop
                                 + totalVolume.entries.fees.quoted
                                 + totalVolume.stops.fees.quoted; /* ? */
          expect(vTotalLossQuoted).to.roundEq(totalVolume.lossQuoted, 14);

          const vTotalProfitQuoted
                  = (totalVolume.takes.orders.base - totalVolume.entries.orders.base)
                  * pAvgTake
                  - totalVolume.takes.fees.quoted
                  - totalVolume.entries.fees.quoted;  /* ? */
          expect(vTotalProfitQuoted).to.floatEq(totalVolume.profitQuoted);

          totalVolumeZeroCheck(totalVolume);

          // the main assertion
          expect(totalVolume.lossQuoted /* ? */).to.roundEq(vRiskExpected);
        });
      }
    }); // end Short Trade describe()

    function totalVolumeZeroCheck(totalVolume: TotalVolumeInfo) {
      expect(totalVolume.lossQuoted /* ? */).to.be.greaterThan(0);
      expect(totalVolume.profitQuoted /* ? */).to.be.greaterThan(0);

      expect(totalVolume.entries.orders.quoted /* ? */).to.be.greaterThan(0);
      expect(totalVolume.entries.orders.base /* ? */).to.be.greaterThan(0);
      expect(totalVolume.entries.fees.quoted /* ? */).is.at.least(0);
      expect(totalVolume.entries.fees.base /* ? */).is.at.least(0);

      expect(totalVolume.stops.orders.quoted /* ? */).to.be.greaterThan(0);
      expect(totalVolume.stops.orders.base /* ? */).to.be.greaterThan(0);
      expect(totalVolume.stops.fees.quoted /* ? */).is.at.least(0);
      expect(totalVolume.stops.fees.base /* ? */).is.at.least(0);

      expect(totalVolume.takes.orders.quoted /* ? */).to.be.greaterThan(0);
      expect(totalVolume.takes.orders.base /* ? */).to.be.greaterThan(0);
      expect(totalVolume.takes.fees.quoted /* ? */).is.at.least(0);
      expect(totalVolume.takes.fees.base /* ? */).is.at.least(0);
    }
  });

  describe('#manageTradeVolume()', () => {

    describe('.leverage.allow', () => {
      const makeArgs = (allow: boolean): TradeVolumeInfoArgs => ({
        deposit: 1000,
        risk: .01,
        preliminaryVolume: 1500,
        maxTradeVolumeQuoted: +Infinity,
        leverage: {
          allow,
          maxTimes: 100,
        },
      });

      it('should be allowed', () => {
        // arrange
        const args = makeArgs(true);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.totalTradeVolumeQuoted).to.eq(1500);
      });
      it('should be not allowed', () => {
        // arrange
        const args = makeArgs(false);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.totalTradeVolumeQuoted).to.eq(1000);
      });
    });

    describe('.leverage.actualTimes', () => {
      const makeArgs = (preliminaryVolume: number): TradeVolumeInfoArgs => ({
        preliminaryVolume,
        deposit: 1000,
        risk: .01,
        maxTradeVolumeQuoted: +Infinity,
        leverage: {
          allow: true,
          maxTimes: 100,
        },
      });
      it('should be 1 in case trade volume doesn\'t requires leverage (can not be less 1)', () => {
        // arrange
        const args = makeArgs(500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actualTimes).to.eq(1);
        expect(info.totalTradeVolumeQuoted).to.eq(500);
      });
      it('should be calculated based on .totalTradeVolumeQuoted', () => {
        // arrange
        const args = makeArgs(15000);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actualTimes).to.eq(15);
        expect(info.totalTradeVolumeQuoted).to.eq(15000);
      });
    });

    describe('.leverage.maxTimes', () => {
      const makeArgs = (preliminaryVolume: number, maxTimes = 100): TradeVolumeInfoArgs => ({
        preliminaryVolume,
        deposit: 1000,
        risk: .01,
        maxTradeVolumeQuoted: +Infinity,
        leverage: {
          maxTimes,
          allow: true,
        },
      });
      it('should not touch in case .actualTimes <= .maxTimes', () => {
        // arrange
        const args = makeArgs(5000, 3);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actualTimes).to.eq(3);
        expect(info.totalTradeVolumeQuoted).to.eq(3000);
      });
      it('should limit .leverage.actualTimes and .totalTradeVolumeQuoted', () => {
        // arrange
        const args = makeArgs(5000, 7);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actualTimes).to.eq(5);
        expect(info.totalTradeVolumeQuoted).to.eq(5000);
      });
    });

    describe('.maxTradeVolumeQuoted', () => {
      const makeArgs = (volume: number, maxVolume = +Infinity): TradeVolumeInfoArgs => ({
        preliminaryVolume: volume,
        maxTradeVolumeQuoted: maxVolume,
        deposit: 1000,
        risk: .01,
        leverage: {
          allow: true,
          maxTimes: 3,
        },
      });
      it('should not touch volume it less or equal .maxTradeVolumeQuoted', () => {
        // arrange
        const args = makeArgs(2000, 2500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actualTimes).to.eq(2);
        expect(info.totalTradeVolumeQuoted).to.eq(2000);
      });
      it('should limit if preliminary volume bigger', () => {
        // arrange
        const args = makeArgs(2600, 2500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actualTimes).to.eq(2.5);
        expect(info.totalTradeVolumeQuoted).to.eq(2500);
      });
      it('should have bigger priority then leverage preferences', () => {
        // arrange
        const args = makeArgs(3500, 2500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actualTimes).to.eq(2.5);
        expect(info.totalTradeVolumeQuoted).to.eq(2500);
      });
      it('should be limited by .leverage.maxTimes if the result of the limitation is less', () => {
        // arrange
        const args = makeArgs(4000, 3500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actualTimes).to.eq(3);
        expect(info.totalTradeVolumeQuoted).to.eq(3000);
      });
    });

  }); // end #manageTradeVolume()

});
