// tslint:disable:no-unused-expression
/* tslint:disable:space-in-parens */
import { ZRisk } from './z-risk';
import { zMath } from './z-math';
import {
  ETradeType,
  PriceAndVolumePart,
  TotalVolumeInfo,
  TradeInfoArgs, TradeOrderBase,
  TradeVolumeManagementArgs,
} from './models';

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
        breakeven: { fee: .002 },
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
        expect(entries[0].volume.order.quoted /* ? */).to.roundEq(10000);
        expect(stops[0].volume.order.quoted /* ? */).to.roundEq(9000);
        expect(takes[0].volume.order.quoted /* ? */).to.roundEq(15000);

        // check that orders base volume equals
        expect(entries[0].volume.order.base /* ? */).to.roundEq(1);
        expect(entries[0].volume.order.base).to.roundEq(stops[0].volume.order.base);
        expect(entries[0].volume.order.base).to.roundEq(takes[0].volume.order.base);

        // check all fees is zero
        expect(entries[0].volume.fee.base).to.equal(0);
        expect(entries[0].volume.fee.quoted).to.equal(0);
        expect(stops[0].volume.fee.base).to.equal(0);
        expect(stops[0].volume.fee.quoted).to.equal(0);
        expect(takes[0].volume.fee.base).to.equal(0);
        expect(takes[0].volume.fee.quoted).to.equal(0);

        // max profit & max loss
        expect(totalVolume.profitQuoted /* ? */).to.roundEq(5000);
        expect(totalVolume.lossQuoted /* ? */).to.roundEq(1000);

        // the main assertion
        expect(totalVolume.lossQuoted /* ? */).to.roundEq(vRiskExpected);
      });

      it('should calculate avg prices correctly', () => {
        // arrange
        const args: TradeInfoArgs = {
          ...commonInfo,
          maxTradeVolumeQuoted: +Infinity,
          deposit: 10 * 1000 * 1000,
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
        };
        const expectedEntryAvgPrice = zRisk.avgPriceOfQuoted(args.entries);  /* ? */
        const expectedStopAvgPrice  = zRisk.avgPriceOfBase(args.stops);  /* ? */
        const expectedTakeAvgPrice  = zRisk.avgPriceOfBase(args.takes);  /* ? */

        // act
        const { avgPrices, totalVolume } = zRisk.getTradeInfo(args);

        // post arrange
        const vEntryBaseAvgPrice = totalVolume.entries.orders.quoted / avgPrices.entry; /* ? */
        const vEntryBaseAvgPriceExpected = totalVolume.entries.orders.base;  /* ? */

        const vStopBaseAvgPrice = totalVolume.stops.orders.quoted / avgPrices.stop; /* ? */
        const vStopBaseAvgPriceExpected = totalVolume.stops.orders.base; /* ? */

        const vTakeBaseAvgPrice = totalVolume.takes.orders.quoted / avgPrices.take; /* ? */
        const vTakeBaseAvgPriceExpected = totalVolume.takes.orders.base; /* ? */

        // assert
        expect(avgPrices.entry).to.roundEq(expectedEntryAvgPrice);
        expect(avgPrices.stop).to.roundEq(expectedStopAvgPrice);
        expect(avgPrices.take).to.roundEq(expectedTakeAvgPrice);

        expect(vEntryBaseAvgPrice).to.roundEq(vEntryBaseAvgPriceExpected);
        expect(vStopBaseAvgPrice).to.roundEq(vStopBaseAvgPriceExpected);
        expect(vTakeBaseAvgPrice).to.roundEq(vTakeBaseAvgPriceExpected);
      });

      it('should calculate breakeven price correctly', () => {
        // arrange
        const args: TradeInfoArgs = {
          ...commonInfo,
          maxTradeVolumeQuoted: +Infinity,
          deposit: 10 * 1000 * 1000,
          entries: [
            { price: 8000, volumePart: .25, fee: 0.001 },
            { price: 7500, volumePart: .25, fee: 0.002 },
            { price: 7000, volumePart: .5,  fee: 0.001 },
          ],
          stops: [
            { price: 6900, volumePart: .5,  fee: 0.002 },
            { price: 6800, volumePart: .25, fee: 0.002 },
            { price: 6500, volumePart: .25, fee: 0.002 },
          ],
          takes: [],
        };

        // act
        const { breakeven, totalVolume: tv } = zRisk.getTradeInfo(args); /* ? $.breakeven.price */

        // post arrange
        const vBreakevenQ = tv.entries.orders.base * breakeven.price; /* ? */
        const vBreakevenFeeQ = vBreakevenQ * breakeven.fee; /* ? */
        const actualLossByBreakevenPrice = vBreakevenQ
                                         - tv.entries.orders.quoted
                                         - tv.entries.fees.quoted
                                         - vBreakevenFeeQ; /* ? */

        // assert
        expect(breakeven.fee).to.eq(args.breakeven.fee);
        expect(actualLossByBreakevenPrice).to.roundEq(0);
      });

      it('should calculate summary volume with previous orders correctly', () => {
        // arrange
        const args: TradeInfoArgs = {
          ...commonInfo,
          maxTradeVolumeQuoted: +Infinity,
          deposit: 1000 * 1000 * 1000,
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
        };

        // act
        const { entries, stops, takes } = zRisk.getTradeInfo(args);

        // assert
        sumWithPreviousOrdersCheck(entries);
        sumWithPreviousOrdersCheck(stops);
        sumWithPreviousOrdersCheck(takes);
      });

      function runLongIt(message: string, args: TradeInfoArgs) {
        it(message, () => {
          // arrange
          const vRiskExpected = args.deposit * args.risk;  /* ? */

          // act
          const { totalVolume: tv, entries, stops, takes } = zRisk.getTradeInfo(args);  /* ? */

          // assert
          const vTotalLossQuoted = tv.entries.orders.quoted
                                 - tv.stops.orders.quoted
                                 + tv.entries.fees.quoted
                                 + tv.stops.fees.quoted; /* ? */
          expect(vTotalLossQuoted).to.floatEq(tv.lossQuoted);

          const vTotalProfitQuoted = tv.takes.orders.quoted
                                   - tv.entries.orders.quoted
                                   - tv.takes.fees.quoted
                                   - tv.entries.fees.quoted;  /* ? */
          expect(vTotalProfitQuoted).to.floatEq(tv.profitQuoted);

          totalVolumeZeroCheck(tv);

          expect(zMath.sumBy(entries, v => v.volume.order.quoted))
            .to.roundEq(tv.entries.orders.quoted);
          expect(zMath.sumBy(entries, v => v.volume.order.base)).to.roundEq(tv.entries.orders.base);
          expect(zMath.sumBy(stops, v => v.volume.order.quoted)).to.roundEq(tv.stops.orders.quoted);
          expect(zMath.sumBy(stops, v => v.volume.order.base)).to.roundEq(tv.stops.orders.base);
          expect(zMath.sumBy(takes, v => v.volume.order.quoted)).to.roundEq(tv.takes.orders.quoted);
          expect(zMath.sumBy(takes, v => v.volume.order.base)).to.roundEq(tv.takes.orders.base);

          // the main assertion
          expect(tv.lossQuoted /* ? */).to.roundEq(vRiskExpected);
        });
      }

    }); // end Long Trade describe()

    describe('Short trade', () => {

      const commonInfo = {
        tradeType: ETradeType.Short,
        deposit: 100 * 1000,
        risk: .01, // 1%
        maxTradeVolumeQuoted: 100000,
        leverage: {
          allow: true,
          maxTimes: 3,
        },
        breakeven: { fee: .002 },
      };

      runShortIt(
        'should calculate Short trade type with multiple orders',
        {
          ...commonInfo,
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
          ...commonInfo,
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
          ...commonInfo,
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
          ...commonInfo,
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

      it('should calculate Short trade with one order and manual orders calculation', () => {
        // arrange
        const args = {
          ...commonInfo,
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
        expect(entries[0].volume.order.base /* ? */).to.roundEq(1);
        expect(stops[0].volume.order.base /* ? */).to.roundEq(10000 / 11000);
        expect(takes[0].volume.order.base /* ? */).to.roundEq(10000 / 5000);

        // check that orders base volume equals
        expect(entries[0].volume.order.quoted /* ? */).to.roundEq(10000);
        expect(entries[0].volume.order.quoted /* ? */).to.roundEq(stops[0].volume.order.quoted);
        expect(entries[0].volume.order.quoted /* ? */).to.roundEq(takes[0].volume.order.quoted);

        // check all fees is zero
        expect(entries[0].volume.fee.base).to.equal(0);
        expect(entries[0].volume.fee.quoted).to.equal(0);
        expect(stops[0].volume.fee.base).to.equal(0);
        expect(stops[0].volume.fee.quoted).to.equal(0);
        expect(takes[0].volume.fee.base).to.equal(0);
        expect(takes[0].volume.fee.quoted).to.equal(0);

        // max profit & max loss
        expect(totalVolume.profitQuoted /* ? */).to.roundEq(5000);
        expect(totalVolume.lossQuoted /* ? */).to.roundEq(1000);

        // the main assertion
        expect(totalVolume.lossQuoted /* ? */).to.roundEq(vRiskExpected);
      });

      it('should calculate avg prices correctly', () => {
        // arrange
        const args: TradeInfoArgs = {
          ...commonInfo,
          maxTradeVolumeQuoted: +Infinity,
          deposit: 1000 * 1000 * 1000,
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
        };
        const expectedEntryAvgPrice = zRisk.avgPriceOfQuoted(args.entries); /* ? */
        const expectedStopAvgPrice  = zRisk.avgPriceOfQuoted(args.stops);   /* ? */
        const expectedTakeAvgPrice  = zRisk.avgPriceOfQuoted(args.takes);   /* ? */

        // act
        const { avgPrices, totalVolume } = zRisk.getTradeInfo(args);

        // post arrange
        const vEntryBaseAvgPrice = totalVolume.entries.orders.quoted / avgPrices.entry; /* ? */
        const vEntryBaseAvgPriceExpected = totalVolume.entries.orders.base;  /* ? */

        const vStopBaseAvgPrice = totalVolume.stops.orders.quoted / avgPrices.stop; /* ? */
        const vStopBaseAvgPriceExpected = totalVolume.stops.orders.base; /* ? */

        const vTakeBaseAvgPrice = totalVolume.takes.orders.quoted / avgPrices.take; /* ? */
        const vTakeBaseAvgPriceExpected = totalVolume.takes.orders.base; /* ? */

        // assert
        expect(avgPrices.entry).to.roundEq(expectedEntryAvgPrice);
        expect(avgPrices.stop).to.roundEq(expectedStopAvgPrice);
        expect(avgPrices.take).to.roundEq(expectedTakeAvgPrice);

        expect(vEntryBaseAvgPrice).to.roundEq(vEntryBaseAvgPriceExpected);
        expect(vStopBaseAvgPrice).to.roundEq(vStopBaseAvgPriceExpected);
        expect(vTakeBaseAvgPrice).to.roundEq(vTakeBaseAvgPriceExpected);
      });

      it('should calculate breakeven price correctly', () => {
        // arrange
        const args: TradeInfoArgs = {
          ...commonInfo,
          maxTradeVolumeQuoted: +Infinity,
          deposit: 10 * 1000 * 1000,
          entries: [
            { price: 8000, volumePart: .25, fee: 0.001 },
            { price: 7500, volumePart: .25, fee: 0.002 },
            { price: 7000, volumePart: .5,  fee: 0.001 },
          ],
          stops: [
            { price: 8100, volumePart: .5,  fee: 0.002 },
            { price: 8200, volumePart: .25, fee: 0.002 },
            { price: 8500, volumePart: .25, fee: 0.002 },
          ],
          takes: [],
        };

        // act
        const { breakeven, totalVolume: tv } = zRisk.getTradeInfo(args); /* ? $.breakeven.price */

        // post arrange
        const vBreakevenQ = tv.entries.orders.base * breakeven.price; /* ? */
        const vBreakevenFeeQ = vBreakevenQ * breakeven.fee; /* ? */
        const actualLossByBreakevenPrice = vBreakevenQ
                                         - tv.entries.orders.quoted
                                         - tv.entries.fees.quoted
                                         - vBreakevenFeeQ; /* ? */

        // assert
        expect(breakeven.fee).to.eq(args.breakeven.fee);
        expect(actualLossByBreakevenPrice).to.roundEq(0);
      });

      it('should calculate summary volume with previous orders correctly', () => {
        // arrange
        const args: TradeInfoArgs = {
          ...commonInfo,
          maxTradeVolumeQuoted: +Infinity,
          deposit: 1000 * 1000 * 1000,
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
        };

        // act
        const { entries, stops, takes } = zRisk.getTradeInfo(args);

        // assert
        sumWithPreviousOrdersCheck(entries);
        sumWithPreviousOrdersCheck(stops);
        sumWithPreviousOrdersCheck(takes);
      });

      function runShortIt(message: string, args: TradeInfoArgs) {
        it(message, () => {
          // arrange
          const vRiskExpected = args.deposit * args.risk;  /* ? */
          const pAvgStop = 1 / zMath.sumBy(args.stops, v => v.volumePart / v.price);
          const pAvgTake = 1 / zMath.sumBy(args.takes, v => v.volumePart / v.price);

          // act
          const { totalVolume: tv, entries, stops, takes } = zRisk.getTradeInfo(args);  /* ? */

          // assert
          const vTotalLossQuoted = (tv.entries.orders.base - tv.stops.orders.base)
                                 * pAvgStop
                                 + tv.entries.fees.quoted
                                 + tv.stops.fees.quoted; /* ? */
          expect(vTotalLossQuoted).to.roundEq(tv.lossQuoted, 14);

          const vTotalProfitQuoted = (tv.takes.orders.base - tv.entries.orders.base)
                                   * pAvgTake
                                   - tv.takes.fees.quoted
                                   - tv.entries.fees.quoted;  /* ? */
          expect(vTotalProfitQuoted).to.floatEq(tv.profitQuoted);

          totalVolumeZeroCheck(tv);

          expect(zMath.sumBy(entries, v => v.volume.order.quoted))
            .to.roundEq(tv.entries.orders.quoted);
          expect(zMath.sumBy(entries, v => v.volume.order.base)).to.roundEq(tv.entries.orders.base);
          expect(zMath.sumBy(stops, v => v.volume.order.quoted)).to.roundEq(tv.stops.orders.quoted);
          expect(zMath.sumBy(stops, v => v.volume.order.base)).to.roundEq(tv.stops.orders.base);
          expect(zMath.sumBy(takes, v => v.volume.order.quoted)).to.roundEq(tv.takes.orders.quoted);
          expect(zMath.sumBy(takes, v => v.volume.order.base)).to.roundEq(tv.takes.orders.base);

          // the main assertion
          expect(tv.lossQuoted /* ? */).to.roundEq(vRiskExpected);
        });
      }
    }); // end Short Trade describe()

    function sumWithPreviousOrdersCheck(orders: TradeOrderBase[]) {
      const sum = {
        orders: { quoted: 0, base: 0 },
        fees:   { quoted: 0, base: 0 },
      };

      orders.forEach((o) => {
        sum.orders.quoted += o.volume.order.quoted;
        sum.orders.base   += o.volume.order.base;
        sum.fees.quoted   += o.volume.fee.quoted;
        sum.fees.base     += o.volume.fee.base;

        expect(o.volume.sumWithPrev).to.deep.eq(sum);
      });
    }

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
      const makeArgs = (allow: boolean): TradeVolumeManagementArgs => ({
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
      const makeArgs = (preliminaryVolume: number): TradeVolumeManagementArgs => ({
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
      const makeArgs = (preliminaryVolume: number, maxTimes = 100): TradeVolumeManagementArgs => ({
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
      const makeArgs = (volume: number, maxVolume = +Infinity): TradeVolumeManagementArgs => ({
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

  describe('#avgPriceOfQuoted()', () => {
    it('should calculate AVG Price for multiple orders', () => {
      // arrange
      const volumeQuoted = 1000;
      const orders: PriceAndVolumePart[] = [
        { price: 500,  volumePart: .5  },
        { price: 1500, volumePart: .25 },
        { price: 2000, volumePart: .15 },
        { price: 1000, volumePart: .1  },
      ];
      const volumeBaseExpected =
              zMath.sumBy(orders, v => volumeQuoted * v.volumePart / v.price);  /* ? */

      // act
      const avgPrice = zRisk.avgPriceOfQuoted(orders);  /* ? */

      // assert
      const volumeBase = volumeQuoted / avgPrice;  /* ? */
      expect(volumeBase).to.roundEq(volumeBaseExpected);
    });

    it('should calculate AVG Price for single order', () => {
      // arrange
      const volumeQuoted = 1000; // 1000 $ for example
      const orders: PriceAndVolumePart[] = [
        { price: 2000, volumePart: 1 },
      ];
      const volumeBaseExpected =
              zMath.sumBy(orders, v => volumeQuoted * v.volumePart / v.price);  /* ? */

      // act
      const avgPrice = zRisk.avgPriceOfQuoted(orders);  /* ? */

      // assert
      const volumeBase = volumeQuoted / avgPrice;  /* ? */
      expect(volumeBase).to.roundEq(volumeBaseExpected);
      expect(avgPrice).to.eq(orders[0].price);
    });
  });

  describe('#avgPriceOfBase()', () => {
    it('should calculate AVG Price for multiple orders', () => {
      // arrange
      const volumeBase = 1000; // 1000 btc for example
      const orders: PriceAndVolumePart[] = [
        { price: 500,  volumePart: .5  },
        { price: 1500, volumePart: .25 },
        { price: 2000, volumePart: .15 },
        { price: 1000, volumePart: .1  },
      ];
      const volumeQuotedExpected =
              zMath.sumBy(orders, v => volumeBase * v.volumePart * v.price);  /* ? */

      // act
      const avgPrice = zRisk.avgPriceOfBase(orders);  /* ? */

      // assert
      const volumeQuoted = volumeBase * avgPrice;  /* ? */
      expect(volumeQuoted).to.roundEq(volumeQuotedExpected);
    });

    it('should calculate AVG Price for single order', () => {
      // arrange
      const volumeBase = 1000;
      const orders: PriceAndVolumePart[] = [
        { price: 2000, volumePart: 1 },
      ];
      const volumeQuotedExpected =
              zMath.sumBy(orders, v => volumeBase * v.volumePart * v.price);  /* ? */

      // act
      const avgPrice = zRisk.avgPriceOfBase(orders);  /* ? */

      // assert
      const volumeQuoted = volumeBase * avgPrice;  /* ? */
      expect(volumeQuoted).to.roundEq(volumeQuotedExpected);
      expect(avgPrice).to.eq(orders[0].price);
    });
  });

});
