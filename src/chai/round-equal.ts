import { AssertionType } from './assertion-type';

export function roundEqualModule(_chai: any, utils: any) {
  const Assertion: AssertionType = _chai.Assertion;

  function round(value: number, precision: number): number {
    const multiplier = 10 ** precision;
    return Math.round(value * multiplier) / multiplier;
  }

  function roundEqual(this: any, expectedFloat: number, precision: number = 10) {
    const actualFloat: any = this._obj;

    // first, our instanceof check, shortcut
    new Assertion(actualFloat).to.be.a('number');

    // second, our type check
    this.assert(
      round(actualFloat, precision) === round(expectedFloat, precision),
      'expected #{this} to equal(floating) #{exp}',
      'expected #{this} to not equal(floating) #{act}',
      expectedFloat,  // expected
      actualFloat,    // actual
    );
  }

  Assertion.addMethod('roundEq', roundEqual);
  Assertion.addMethod('roundEql', roundEqual);
  Assertion.addMethod('roundEqls', roundEqual);
  Assertion.addMethod('roundEqual', roundEqual);
  Assertion.addMethod('roundEquals', roundEqual);
}
