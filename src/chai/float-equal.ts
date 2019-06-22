import { AssertionType } from './assertion-type';

export function floatEqualModule(_chai: any, utils: any) {
  const Assertion: AssertionType = _chai.Assertion;

  function floatEqual(this: any, expectedFloat: number) {
    const actualFloat: any = this._obj;

    // first, our instanceof check, shortcut
    new Assertion(actualFloat).to.be.a('number');

    // second, our type check
    this.assert(
      Math.abs(actualFloat - expectedFloat) < Number.EPSILON,
      'expected #{this} to equal(floating) #{exp}',
      'expected #{this} to not equal(floating) #{act}',
      expectedFloat,  // expected
      actualFloat,    // actual
    );
  }

  Assertion.addMethod('floatEq', floatEqual);
  Assertion.addMethod('floatEql', floatEqual);
  Assertion.addMethod('floatEqls', floatEqual);
  Assertion.addMethod('floatEqual', floatEqual);
  Assertion.addMethod('floatEquals', floatEqual);
}
