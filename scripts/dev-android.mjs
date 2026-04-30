import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, '..');
const frontendDir = join(rootDir, 'frontend');
const backendDir = join(rootDir, 'backend');
const logDir = join(rootDir, '.logs');
const wslExe = process.env.WSL_EXE || 'wsl.exe';
const adbExe = process.env.ANDROID_ADB_EXE || 'C:\\Users\\maril\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe';
const pixel7Name = process.env.PIXEL_7_AVD_NAME || 'Pixel_7';

mkdirSync(logDir, { recursive: true });

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    ...options,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    const stdout = (result.stdout || '').trim();
    throw new Error([stdout, stderr].filter(Boolean).join('\n') || `${command} ${args.join(' ')}`);
  }
  return (result.stdout || '').trim();
}

function runDetached(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'ignore',
    detached: true,
    windowsHide: true,
    ...options,
  });
  child.unref();
  return child;
}

function runWsl(command) {
  return run(wslExe, ['bash', '-lc', command], { cwd: rootDir });
}

function curlOk(url) {
  const probe = spawnSync('powershell.exe', ['-NoProfile', '-Command', `try { (Invoke-WebRequest -UseBasicParsing ${url}).StatusCode } catch { '' }`], {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  return (probe.stdout || '').includes('200');
}

function waitFor(predicate, attempts, delayMs) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const tick = () => {
      tries += 1;
      try {
        if (predicate()) {
          resolve(true);
          return;
        }
      } catch {
        // keep retrying
      }
      if (tries >= attempts) {
        reject(new Error('Timed out waiting for condition'));
        return;
      }
      setTimeout(tick, delayMs);
    };
    tick();
  });
}

function adb(args, options = {}) {
  return run(adbExe, args, options);
}

function adbAsync(args, options = {}) {
  return runDetached(adbExe, args, options);
}

function startBackend() {
  if (curlOk('http://127.0.0.1:8000/docs')) {
    return;
  }
  runDetached(wslExe, ['bash', '-lc', `cd '/mnt/c/Users/maril/OneDrive/Documents/GitHub/mvp/backend' && ./.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > '/mnt/c/Users/maril/OneDrive/Documents/GitHub/mvp/.logs/backend.log' 2>&1`], { cwd: rootDir });
}

function startMetro() {
  const metroStatus = run('powershell.exe', ['-NoProfile', '-Command', "try { (Invoke-WebRequest -UseBasicParsing http://localhost:8081/status).Content } catch { '' }"]);
  if (metroStatus.trim() === 'packager-status:running') {
    return;
  }
  runDetached(wslExe, ['bash', '-lc', `cd '/mnt/c/Users/maril/OneDrive/Documents/GitHub/mvp/frontend' && npm start > '/mnt/c/Users/maril/OneDrive/Documents/GitHub/mvp/.logs/metro.log' 2>&1`], { cwd: rootDir });
}

function detectEmulatorSerial() {
  const devices = adb(['devices']).split('\n').slice(1).map((line) => line.trim().split(/\s+/)[0]).filter(Boolean);
  for (const serial of devices) {
    if (!serial.startsWith('emulator-')) {
      continue;
    }
    const avdName = adb(['-s', serial, 'emu', 'avd', 'name']);
    if (avdName.trim() === pixel7Name) {
      return serial;
    }
  }
  return devices.find((serial) => serial.startsWith('emulator-')) || '';
}

async function main() {
  console.log('[1/4] Starting backend...');
  startBackend();
  await waitFor(() => curlOk('http://127.0.0.1:8000/docs'), 30, 1000);
  console.log('Backend is running.');

  console.log('[2/4] Starting Metro...');
  startMetro();
  await waitFor(() => run('powershell.exe', ['-NoProfile', '-Command', "try { (Invoke-WebRequest -UseBasicParsing http://localhost:8081/status).Content } catch { '' }"]).trim() === 'packager-status:running', 45, 1000);
  console.log('Metro is running.');

  console.log('[3/4] Resolving emulator...');
  let emulatorSerial = process.env.EMULATOR_SERIAL || detectEmulatorSerial();
  if (!emulatorSerial) {
    throw new Error('No running emulator detected. Start the Pixel 7 emulator and retry.');
  }
  console.log(`Using emulator: ${emulatorSerial}`);

  console.log('[4/4] Setting adb reverse and launching Android app...');
  adb(['-s', emulatorSerial, 'reverse', 'tcp:8081', 'tcp:8081']);
  adb(['-s', emulatorSerial, 'reverse', 'tcp:8000', 'tcp:8000']);
  console.log(adb(['-s', emulatorSerial, 'reverse', '--list']));

  const env = { ...process.env, ANDROID_SERIAL: emulatorSerial };
  const reactNativeCli = join(frontendDir, 'node_modules', '@react-native-community', 'cli', 'build', 'bin.js');
  const child = spawn('node', [reactNativeCli, 'run-android', '--deviceId', emulatorSerial], {
    cwd: frontendDir,
    env,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});