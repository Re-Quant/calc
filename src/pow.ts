export function pow(a: number, b: number): number {
  console.log(IS_ENV_TEST);

  if (b < 100) {
    return a ** b;
  } else {
    throw new Error('Wrong');
  }
}
