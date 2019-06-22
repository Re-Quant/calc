export interface AssertionType {
  new(value: number | Date, message?: string): Chai.Assertion;

  addMethod(name: string, fn: (...args: any[]) => any): void;
}
