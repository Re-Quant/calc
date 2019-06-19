// tslint:disable:no-unused-expression
import { ZMath } from './z-math';

describe('ZMath', () => {

  let zMath: ZMath;
  beforeEach(() => {
    zMath = new ZMath();
  });

  describe('sum()', () => {
    it('should throw TypeError on wrong arguments', () => {
      // @ts-ignore
      expect(() => zMath.sigmaSum(0)).to.throw(TypeError);
      // @ts-ignore
      expect(() => zMath.sigmaSum(() => 0)).to.throw(TypeError);
      // @ts-ignore
      expect(() => zMath.sigmaSum(1, 1, 1, () => 0)).to.throw(TypeError);
      // @ts-ignore
      expect(() => zMath.sigmaSum(1, [1], () => 0)).to.throw(TypeError);
      // @ts-ignore
      expect(() => zMath.sigmaSum([1], 1, () => 0)).to.throw(TypeError);
    });

    it('should calculate sum with "from" & "to"', () => {
      // arrange
      const expectedSum = 10 * 100
                        + 11 * 100
                        + 12 * 100
                        + 13 * 100;

      // act
      const sum = zMath.sigmaSum(10, 13, i => i * 100);

      // assert
      expect(sum).to.eq(expectedSum);
    });

    it('should calculate sum with "from" only', () => {
      // arrange
      const payload = [100, 200, 300, 400, 500];
      const expectedSum = payload.reduce((a, b) => a + b);

      // act
      const sum = zMath.sigmaSum(payload.length - 1, i => payload[i]);

      // assert
      expect(sum).to.eq(expectedSum);
    });

    it('should calculate sum with "payload" using index', () => {
      // arrange
      const payload = [100, 200, 300, 400, 500];
      const expectedSum = payload.reduce((a, b) => a + b);

      // act
      const sum = zMath.sigmaSum(payload, i => payload[i]);

      // assert
      expect(sum).to.eq(expectedSum);
    });

    it('should calculate sum with "payload" using value', () => {
      // arrange
      const payload = [100, 200, 300, 400, 500];
      const expectedSum = payload.reduce((a, b, i) => a + b + i * 1000);

      // act
      const sum = zMath.sigmaSum(payload, (i, v) => v + i * 1000);

      // assert
      expect(sum).to.eq(expectedSum);
    });

  });

  it('eq() should compare float numbers correctly', () => {
    // arrange
    const source = .1 + .2;  /* ? */
    const sourceWrong = .03 + Number.EPSILON;  /* ? */
    const expected = .3;  /* ? */

    // act
    const res = zMath.eq(source, expected);
    const resWrong = zMath.eq(sourceWrong, expected);

    // assert
    expect(res).to.be.true;
    expect(resWrong).to.be.false;
  });

  it('round() should round float numbers to the nearest', () => {
    // act
    const res1 = zMath.round(10.123111, 3);  /* ? */
    const res2 = zMath.round(10.123411, 3);  /* ? */
    const res3 = zMath.round(10.123511, 3);  /* ? */
    const res4 = zMath.round(10.123911, 3);  /* ? */

    // assert
    expect(zMath.eq(res1, 10.123)).to.be.true;
    expect(zMath.eq(res2, 10.123)).to.be.true;
    expect(zMath.eq(res3, 10.124)).to.be.true;
    expect(zMath.eq(res4, 10.124)).to.be.true;
  });

  it('ceil() should round float numbers to the up', () => {
    // act
    const res1 = zMath.ceil(10.123111, 3);  /* ? */
    const res2 = zMath.ceil(10.123411, 3);  /* ? */
    const res3 = zMath.ceil(10.123511, 3);  /* ? */
    const res4 = zMath.ceil(10.123911, 3);  /* ? */

    // assert
    expect(zMath.eq(res1, 10.124)).to.be.true;
    expect(zMath.eq(res2, 10.124)).to.be.true;
    expect(zMath.eq(res3, 10.124)).to.be.true;
    expect(zMath.eq(res4, 10.124)).to.be.true;
  });

  it('floor() should round float numbers to the up', () => {
    // act
    const res1 = zMath.floor(10.123111, 3);  /* ? */
    const res2 = zMath.floor(10.123411, 3);  /* ? */
    const res3 = zMath.floor(10.123511, 3);  /* ? */
    const res4 = zMath.floor(10.123911, 3);  /* ? */

    // assert
    expect(zMath.eq(res1, 10.123)).to.be.true;
    expect(zMath.eq(res2, 10.123)).to.be.true;
    expect(zMath.eq(res3, 10.123)).to.be.true;
    expect(zMath.eq(res4, 10.123)).to.be.true;
  });

  it('sum() should calculate the sum of the numbers array', () => {
    // arrange
    const source = [1, 2, 3, 4, 5];
    const expected = 1 + 2 + 3 + 4 + 5;

    // act
    const sum = zMath.sum(source);

    // assert
    expect(sum).to.equal(expected);
  });

  describe('subBy()', () => {

    it('should calculate sum with field name as picker', () => {
      // arrange
      const data = [{ a: 1, b: 10 }, { a: 2, b: 20 }, { a: 3, b: 30 }];
      const expected = data[0].a + data[1].a + data[2].a;

      // act
      const sum = zMath.sumBy(data, 'a');

      // assert
      expect(sum).to.be.eq(expected);
    });

    it('should calculate sum with callback as picker', () => {
      // arrange
      const data = [{ a: 1, b: 10 }, { a: 2, b: 20 }, { a: 3, b: 30 }];
      const expected = data[0].a + data[1].a + data[2].a;

      // act
      const sum = zMath.sumBy(data, v => v.a);

      // assert
      expect(sum).to.be.eq(expected);
    });
  });

});
