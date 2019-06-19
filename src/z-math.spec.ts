import { ZMath } from './z-math';

describe('ZMath', () => {

  let zMath: ZMath;
  beforeEach(() => {
    zMath = new ZMath();
  });

  describe('sum()', () => {
    it('should throw TypeError on wrong arguments', () => {
      // @ts-ignore
      expect(() => zMath.sum(0)).to.throw(TypeError);
      // @ts-ignore
      expect(() => zMath.sum(() => 0)).to.throw(TypeError);
      // @ts-ignore
      expect(() => zMath.sum(1, 1, 1, () => 0)).to.throw(TypeError);
      // @ts-ignore
      expect(() => zMath.sum(1, [1], () => 0)).to.throw(TypeError);
      // @ts-ignore
      expect(() => zMath.sum([1], 1, () => 0)).to.throw(TypeError);
    });

    it('should calculate sum with "from" & "to"', () => {
      // arrange
      const expectedSum = 10 * 100
                        + 11 * 100
                        + 12 * 100
                        + 13 * 100;

      // act
      const sum = zMath.sum(10, 13, i => i * 100);

      // assert
      expect(sum).to.eq(expectedSum);
    });

    it('should calculate sum with "from" only', () => {
      // arrange
      const payload = [100, 200, 300, 400, 500];
      const expectedSum = payload.reduce((a, b) => a + b);

      // act
      const sum = zMath.sum(payload.length - 1, i => payload[i]);

      // assert
      expect(sum).to.eq(expectedSum);
    });

    it('should calculate sum with "payload" using index', () => {
      // arrange
      const payload = [100, 200, 300, 400, 500];
      const expectedSum = payload.reduce((a, b) => a + b);

      // act
      const sum = zMath.sum(payload, i => payload[i]);

      // assert
      expect(sum).to.eq(expectedSum);
    });

    it('should calculate sum with "payload" using value', () => {
      // arrange
      const payload = [100, 200, 300, 400, 500];
      const expectedSum = payload.reduce((a, b, i) => a + b + i);

      // act
      const sum = zMath.sum(payload, (i, v) => v + i);

      // assert
      expect(sum).to.eq(expectedSum);
    });

  });

});
