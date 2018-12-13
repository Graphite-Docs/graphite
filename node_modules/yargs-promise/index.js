class YargsPromise {
  constructor(yargs, ctx) {
    this.ctx = ctx || {};
    this.yargs = yargs;
    this.parse = this.parse.bind(this);
    this.command = this.yargs.command;
    this.commandDir = this.yargs.commandDir;
  }

  parse(msg) {
    const yargs = this.yargs;
    let returnArgs;
    return new Promise((resolve, reject) => {
      let context = Object.assign({}, this.ctx, {resolve, reject});

      yargs.parse(msg, context, function(error, argv, output) {
        returnArgs = argv;
        // the reject/resolve calls below are from
        // internal yarg behavior.
        if (error) {
          // reject built in validation error
          return argv.reject(error);
        }
        // resolve built in output
        return argv.resolve(output);
      });
    })
      .then(p => Promise.resolve(p)) // resolve possible promise
      .then(data => {
        if (data && data.argv) {
          return data;
        }

        return {data, argv: returnArgs};
      })
      .catch((p) => // resolve possible promise
        Promise.resolve(p).then(error => {
          if (error && error.argv) {
            return Promise.reject(error);
          }

          return Promise.reject({error, argv: returnArgs});
        })
      );
  }
}

module.exports = YargsPromise;
