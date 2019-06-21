
// tslint:disable-next-line:no-namespace
declare namespace Chai {
  interface Assertion {
    floatEq(value: number): Assertion;
    floatEql(value: number): Assertion;
    floatEqls(value: number): Assertion;
    floatEqual(value: number): Assertion;
    floatEquals(value: number): Assertion;
  }
}

declare const expect: Chai.ExpectStatic;

declare const ENV: 'production' | 'development' | 'test';
declare const IS_ENV_PROD: boolean;
declare const IS_ENV_TEST: boolean;
declare const IS_ENV_DEV: boolean;
