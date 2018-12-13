declare module 'glob' {    
  declare type Callback = (err: ?Error, matches: ?Array<String>) => void;

  declare module.exports: {
    (f: string, opts?: any | Callback, callback?: Callback): void;
    sync(pattern: string, options?: any): Array<string>;
  };
}