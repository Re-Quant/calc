import * as index from './index';
import { ZRisk } from './z-risk';
import { ZMath } from './z-math';

describe('index.ts', () => {
  it(`should export an instance of ${ZRisk.name} class as the "zRisk" variable`, () => {
    expect(index.zRisk).to.be.instanceOf(ZRisk);
  });
  it(`should export an instance of ${ZMath.name} class as the "zMath" variable`, () => {
    expect(index.zMath).to.be.instanceOf(ZMath);
  });
});
