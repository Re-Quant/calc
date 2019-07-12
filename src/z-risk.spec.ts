// tslint:disable:no-unused-expression
/* tslint:disable:space-in-parens */
import { ZRisk } from './z-risk';
import { zMath } from './z-math';
import {
  ETradeType,
  PriceAndVolumePart,
  TotalVolumeInfo,
  TradeInfoArgs,
  TradeOrder,
  TradeVolumeManagementArgs,
} from './models';

// @todo: Make common data sets
// @todo: Make trusty calculated data sets

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
          max: 3,
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
        expect(totalVolume.profit.quoted /* ? */).to.roundEq(5000);
        expect(totalVolume.loss.quoted /* ? */).to.roundEq(1000);

        // the main assertion
        expect(totalVolume.loss.quoted /* ? */).to.roundEq(vRiskExpected);
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

      it('should calculate percentages of deposit in total volumes correctly', () => {
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
        const { totalVolume: { entries, stops, takes } } = zRisk.getTradeInfo(args);

        // assert
        expect(entries.orders.percent).to.floatEq(entries.orders.quoted / args.deposit);
        expect(stops.orders.percent).to.floatEq(stops.orders.quoted / args.deposit);
        expect(takes.orders.percent).to.floatEq(takes.orders.quoted / args.deposit);
      });

      it('should calculate risk ratio', () => {
        // arrange
        const args: TradeInfoArgs = {
          ...commonInfo,
          maxTradeVolumeQuoted: +Infinity,
          deposit: 1000 * 1000,
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
        const { totalVolume: { riskRatio, profit, loss } } = zRisk.getTradeInfo(args);

        // assert
        expect(riskRatio).to.floatEq(profit.quoted / loss.quoted);
      });

      it('should calculate volume diff\'s for for each order correctly', () => {
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
        const { entries, stops, takes, totalVolume: tv } = zRisk.getTradeInfo(args);

        // assert
        // checking sign
        entries.forEach((o) => {
          expect(o.volume.diff.current.quoted).to.be.lessThan(0);
          expect(o.volume.diff.current.percent).to.be.lessThan(0);
          expect(o.volume.diff.total.quoted).to.be.lessThan(0);
          expect(o.volume.diff.total.percent).to.be.lessThan(0);

          // checking percentages
          expect(o.volume.diff.total.percent).to.roundEq(o.volume.diff.total.quoted / args.deposit);
          expect(o.volume.diff.current.percent)
            .to.roundEq(o.volume.diff.current.quoted / args.deposit);
        });
        stops.forEach((o) => {
          expect(o.volume.diff.current.quoted).to.be.lessThan(0);
          expect(o.volume.diff.current.percent).to.be.lessThan(0);
          expect(o.volume.diff.total.quoted).to.be.lessThan(0);
          expect(o.volume.diff.total.percent).to.be.lessThan(0);

          // checking percentages
          expect(o.volume.diff.total.percent).to.roundEq(o.volume.diff.total.quoted / args.deposit);
          expect(o.volume.diff.current.percent)
            .to.roundEq(o.volume.diff.current.quoted / args.deposit);
        });
        takes.forEach((o) => {
          expect(o.volume.diff.current.quoted).to.be.greaterThan(0);
          expect(o.volume.diff.current.percent).to.be.greaterThan(0);
          expect(o.volume.diff.total.quoted).to.be.greaterThan(0);
          expect(o.volume.diff.total.percent).to.be.greaterThan(0);

          // checking percentages
          expect(o.volume.diff.total.percent).to.roundEq(o.volume.diff.total.quoted / args.deposit);
          expect(o.volume.diff.current.percent)
            .to.roundEq(o.volume.diff.current.quoted / args.deposit);
        });

        // comparing with already known volume totals
        expect(entries[2].volume.diff.total.quoted).to.roundEq(tv.entries.fees.quoted * -1);
        expect(takes[3].volume.diff.total.quoted).to.roundEq(tv.profit.quoted, 8);
        expect(stops[2].volume.diff.total.quoted).to.roundEq(tv.loss.quoted * -1, 7);
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
          expect(vTotalLossQuoted).to.floatEq(tv.loss.quoted);
          expect(vTotalLossQuoted / args.deposit).to.floatEq(tv.loss.percent);

          const vTotalProfitQuoted = tv.takes.orders.quoted
                                   - tv.entries.orders.quoted
                                   - tv.takes.fees.quoted
                                   - tv.entries.fees.quoted;  /* ? */
          expect(vTotalProfitQuoted).to.floatEq(tv.profit.quoted);
          expect(vTotalProfitQuoted / args.deposit).to.floatEq(tv.profit.percent);

          totalVolumeZeroCheck(tv);

          const s = zMath.sumBy.bind(zMath);
          expect(s(entries, v => v.volume.order.quoted)).to.roundEq(tv.entries.orders.quoted);
          expect(s(entries, v => v.volume.order.base  )).to.roundEq(tv.entries.orders.base);
          expect(s(stops,   v => v.volume.order.quoted)).to.roundEq(tv.stops.orders.quoted);
          expect(s(stops,   v => v.volume.order.base  )).to.roundEq(tv.stops.orders.base);
          expect(s(takes,   v => v.volume.order.quoted)).to.roundEq(tv.takes.orders.quoted);
          expect(s(takes,   v => v.volume.order.base  )).to.roundEq(tv.takes.orders.base);

          // the main assertion
          expect(tv.loss.quoted /* ? */).to.roundEq(vRiskExpected);
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
          max: 3,
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
        expect(totalVolume.profit.quoted /* ? */).to.roundEq(5000);
        expect(totalVolume.loss.quoted /* ? */).to.roundEq(1000);

        // the main assertion
        expect(totalVolume.loss.quoted /* ? */).to.roundEq(vRiskExpected);
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

      it('should calculate percentages of deposit in total volumes correctly', () => {
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
        const { totalVolume: { entries, stops, takes } } = zRisk.getTradeInfo(args);

        // assert
        expect(entries.orders.percent).to.floatEq(entries.orders.quoted / args.deposit);
        expect(stops.orders.percent).to.floatEq(stops.orders.quoted / args.deposit);
        expect(takes.orders.percent).to.floatEq(takes.orders.quoted / args.deposit);
      });

      it('should calculate risk ratio', () => {
        // arrange
        const args: TradeInfoArgs = {
          ...commonInfo,
          maxTradeVolumeQuoted: +Infinity,
          deposit: 1000 * 1000,
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
        const { totalVolume: { riskRatio, profit, loss } } = zRisk.getTradeInfo(args);

        // assert
        expect(riskRatio).to.floatEq(profit.quoted / loss.quoted);
      });

      it('should calculate volume diff\'s for for each order correctly', () => {
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
        const { entries, stops, takes, totalVolume: tv } = zRisk.getTradeInfo(args);

        // assert
        // checking sign
        entries.forEach((o) => {
          expect(o.volume.diff.current.quoted).to.be.lessThan(0);
          expect(o.volume.diff.current.percent).to.be.lessThan(0);
          expect(o.volume.diff.total.quoted).to.be.lessThan(0);
          expect(o.volume.diff.total.percent).to.be.lessThan(0);

          // checking percentages
          expect(o.volume.diff.total.percent).to.roundEq(o.volume.diff.total.quoted / args.deposit);
          expect(o.volume.diff.current.percent)
            .to.roundEq(o.volume.diff.current.quoted / args.deposit);
        });
        stops.forEach((o) => {
          expect(o.volume.diff.current.quoted).to.be.lessThan(0);
          expect(o.volume.diff.current.percent).to.be.lessThan(0);
          expect(o.volume.diff.total.quoted).to.be.lessThan(0);
          expect(o.volume.diff.total.percent).to.be.lessThan(0);

          // checking percentages
          expect(o.volume.diff.total.percent).to.roundEq(o.volume.diff.total.quoted / args.deposit);
          expect(o.volume.diff.current.percent)
            .to.roundEq(o.volume.diff.current.quoted / args.deposit);
        });
        takes.forEach((o) => {
          expect(o.volume.diff.current.quoted).to.be.greaterThan(0);
          expect(o.volume.diff.current.percent).to.be.greaterThan(0);
          expect(o.volume.diff.total.quoted).to.be.greaterThan(0);
          expect(o.volume.diff.total.percent).to.be.greaterThan(0);

          // checking percentages
          expect(o.volume.diff.total.percent).to.roundEq(o.volume.diff.total.quoted / args.deposit);
          expect(o.volume.diff.current.percent)
            .to.roundEq(o.volume.diff.current.quoted / args.deposit);
        });

        // comparing with already known volume totals
        expect(entries[2].volume.diff.total.quoted).to.roundEq(tv.entries.fees.quoted * -1);
        expect(stops[2].volume.diff.total.quoted).to.roundEq(tv.loss.quoted * -1);
        expect(takes[3].volume.diff.total.quoted).to.roundEq(tv.profit.quoted);
      });

      function runShortIt(message: string, args: TradeInfoArgs) {
        it(message, () => {
          // arrange
          const vRiskExpected = args.deposit * args.risk;  /* ? */

          // act
          const { totalVolume: tv, entries, stops, takes } = zRisk.getTradeInfo(args);  /* ? */

          // assert

          const lossNoFee = tv.entries.orders.quoted * (
              zMath.sumBy(entries, v => v.volumePart / v.price)
            * zMath.sumBy(stops,   v => v.volumePart * v.price)
            - 1
          );
          const vTotalLossQuoted = lossNoFee
                                 + tv.entries.fees.quoted
                                 + tv.stops.fees.quoted; /* ? */
          expect(vTotalLossQuoted).to.roundEq(tv.loss.quoted);
          expect(vTotalLossQuoted / args.deposit).to.roundEq(tv.loss.percent);

          const profitNoFee = tv.stops.orders.quoted * (
              1
            - zMath.sumBy(entries, v => v.volumePart / v.price)
            * zMath.sumBy(takes,   v => v.volumePart * v.price)
          ); /* ? */
          const vTotalProfitQuoted = profitNoFee
                                   - tv.takes.fees.quoted
                                   - tv.entries.fees.quoted;  /* ? */
          expect(vTotalProfitQuoted).to.roundEq(tv.profit.quoted);
          expect(vTotalProfitQuoted / args.deposit).to.floatEq(tv.profit.percent);

          totalVolumeZeroCheck(tv);

          const s = zMath.sumBy.bind(zMath);
          expect(s(entries, v => v.volume.order.quoted)).to.roundEq(tv.entries.orders.quoted);
          expect(s(entries, v => v.volume.order.base  )).to.roundEq(tv.entries.orders.base);
          expect(s(stops,   v => v.volume.order.quoted)).to.roundEq(tv.stops.orders.quoted);
          expect(s(stops,   v => v.volume.order.base  )).to.roundEq(tv.stops.orders.base);
          expect(s(takes,   v => v.volume.order.quoted)).to.roundEq(tv.takes.orders.quoted);
          expect(s(takes,   v => v.volume.order.base  )).to.roundEq(tv.takes.orders.base);

          // the main assertion
          expect(tv.loss.quoted /* ? */).to.roundEq(vRiskExpected);
        });
      }
    }); // end Short Trade describe()

    function sumWithPreviousOrdersCheck(orders: TradeOrder[]) {
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
      expect(totalVolume.loss.quoted /* ? */).to.be.greaterThan(0);
      expect(totalVolume.loss.percent /* ? */).to.be.greaterThan(0);
      expect(totalVolume.profit.quoted /* ? */).to.be.greaterThan(0);
      expect(totalVolume.profit.percent /* ? */).to.be.greaterThan(0);

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
          max: 100,
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

    describe('.leverage.actual', () => {
      const makeArgs = (preliminaryVolume: number): TradeVolumeManagementArgs => ({
        preliminaryVolume,
        deposit: 1000,
        risk: .01,
        maxTradeVolumeQuoted: +Infinity,
        leverage: {
          allow: true,
          max: 100,
        },
      });
      it('should be 1 in case trade volume doesn\'t requires leverage (can not be less 1)', () => {
        // arrange
        const args = makeArgs(500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actual).to.eq(1);
        expect(info.totalTradeVolumeQuoted).to.eq(500);
      });
      it('should be calculated based on .totalTradeVolumeQuoted', () => {
        // arrange
        const args = makeArgs(15000);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actual).to.eq(15);
        expect(info.totalTradeVolumeQuoted).to.eq(15000);
      });
    });

    describe('.leverage.max', () => {
      const makeArgs = (preliminaryVolume: number, max = 100): TradeVolumeManagementArgs => ({
        preliminaryVolume,
        deposit: 1000,
        risk: .01,
        maxTradeVolumeQuoted: +Infinity,
        leverage: {
          max,
          allow: true,
        },
      });
      it('should not touch in case .actual <= .max', () => {
        // arrange
        const args = makeArgs(5000, 3);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actual).to.eq(3);
        expect(info.totalTradeVolumeQuoted).to.eq(3000);
      });
      it('should limit .leverage.actual and .totalTradeVolumeQuoted', () => {
        // arrange
        const args = makeArgs(5000, 7);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actual).to.eq(5);
        expect(info.totalTradeVolumeQuoted).to.eq(5000);
      });
    });

    describe('.marginCallPrice', () => {
      it('should calculate the Margin Call Price for Long trade', () => {
        // @todo: Implement it
        // arrange

        // act

        // assert
      });

      it('should calculate the Margin Call Price for Short trade', () => {
        // @todo: Implement it
        // arrange

        // act

        // assert
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
          max: 3,
        },
      });
      it('should not touch volume it less or equal .maxTradeVolumeQuoted', () => {
        // arrange
        const args = makeArgs(2000, 2500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actual).to.eq(2);
        expect(info.totalTradeVolumeQuoted).to.eq(2000);
      });
      it('should limit if preliminary volume bigger', () => {
        // arrange
        const args = makeArgs(2600, 2500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actual).to.eq(2.5);
        expect(info.totalTradeVolumeQuoted).to.eq(2500);
      });
      it('should have bigger priority then leverage preferences', () => {
        // arrange
        const args = makeArgs(3500, 2500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actual).to.eq(2.5);
        expect(info.totalTradeVolumeQuoted).to.eq(2500);
      });
      it('should be limited by .leverage.max if the result of the limitation is less', () => {
        // arrange
        const args = makeArgs(4000, 3500);
        // act
        const info = zRisk.manageTradeVolume(args);
        // assert
        expect(info.leverage.actual).to.eq(3);
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
