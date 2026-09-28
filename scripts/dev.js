const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const command = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'npm';
const args = isWindows ? ['/d', '/s', '/c', 'npm run dev'] : ['run', 'dev'];
const services = [
  { name: 'Backend', cwd: path.join(root, 'backend') },
  { name: 'Frontend', cwd: path.join(root, 'frontend') },
];

let stopping = false;
const children = services.map(({ name, cwd }) => {
  console.log(`[${name}] Iniciando...`);
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
  });
  child.on('error', (error) => {
    console.error(`[${name}] No se pudo iniciar: ${error.message}`);
    shutdown(1);
  });
  child.on('exit', (code) => {
    if (!stopping && code !== 0) shutdown(code || 1);
  });
  return child;
});

function shutdown(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.pid || child.exitCode !== null) continue;
    if (isWindows) {
      spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  }
  process.exitCode = exitCode;
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
