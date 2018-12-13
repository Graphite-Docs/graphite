var cp = require('child_process');
var verbose = Boolean(process.env.URSA_VERBOSE);
if (verbose) {
  var p = cp.spawn(process.execPath, [process.env.npm_execpath, 'run', 'rebuild'], {cwd: process.cwd(), stdio: 'inherit'});
} else {
  var p = cp.spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'rebuild'], {cwd: process.cwd()});
  if (p.status || p.signal || p.error) {
    console.log('ursaNative bindings compilation fail. This is not an issue. Modules that depend on it will use fallbacks.');
    var fs = require('fs');
    if (p.error) {
      fs.writeFileSync('./stderr.log', p.error.stack);
    } else {
      fs.writeFileSync('./stdout.log', p.stdout);
      fs.writeFileSync('./stderr.log', p.stderr);
    }
  }
}
