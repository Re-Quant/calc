import { AssertionType } from './assertion-type';

export function roundEqualModule(_chai: any): void {
  // eslint-disable-next-line prefer-destructuring
  const Assertion: AssertionType = _chai.Assertion;

  function round(value: number, precision: number): number {
    const multiplier = 10 ** precision;
    return Math.round(value * multiplier) / multiplier;
  }

  function roundEqual(this: any, expectedFloat: number, precision = 10): void {
    const actualFloat: any = this._obj; // eslint-disable-line no-underscore-dangle

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
