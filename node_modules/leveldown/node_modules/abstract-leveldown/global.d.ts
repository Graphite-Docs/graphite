// This file is required for the use of process.browser, which is
// not defined in @types/node but a property added by browserify.
declare namespace NodeJS {
  interface Process {
    browser: boolean;
  }
}
