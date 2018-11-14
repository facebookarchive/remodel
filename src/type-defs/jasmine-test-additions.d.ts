declare namespace jasmine {
  interface Matchers {
    toEqualJSON(expected: any, expectationFailOutput?: any): boolean;
  }
}
