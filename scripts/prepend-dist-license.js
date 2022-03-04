// eslint-disable-next-line @typescript-eslint/no-var-requires
const shelljs = require('shelljs');

const files = shelljs.ls('dist/*.pgmmv.js');

files.forEach((path) => {
  shelljs.cat('DIST-LICENSE').cat(path).to(path);
});
