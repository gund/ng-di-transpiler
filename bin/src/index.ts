import { renderHelp } from './help';
import { runNgdt } from './runNgdt';
import { version } from './help';
import minimist from 'minimist';

const command = minimist(process.argv.slice(2), {
  alias: {
    v: 'version',
    h: 'help',
    c: 'config',
    p: 'postfix'
  }
});

if (command['version']) {
  console.log(`ngdt version ${version}`);
} else if (command['help']) {
  console.log(renderHelp());
} else {
  runNgdt(command);
}
