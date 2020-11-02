import { spawn } from 'child_process';
import * as winston from 'winston';
import { Optional } from 'typescript-optional';
import * as path from 'path';
import * as readline from 'readline';

export const prompt = async (msg: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const formattedMsg = msg.replace(/\s*?$/, ' ');
  return new Promise((resolve, reject) => {
    rl.question(formattedMsg, answer => {
      rl.close();
      resolve(answer);
    });
    rl.on('error', e => reject(e));
  });
};

export const log = winston.createLogger({
  transports: new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(msg => {
        const messageString: string = Optional.ofNullable(msg.message).orElse('');
        return `${msg.level}: ${messageString}`;
      }),
    ),
  }),
});

export const shell = async (command: string, dirOverride?: string, args?: string[]): Promise<string> => {
  const dir: string = Optional.ofNullable(dirOverride).orElse(path.join(__dirname, '../')); // <- default to project root
  const parts = command.split(/\s/);
  const c: string = args
    ? command
    : Optional.ofNullable(parts.shift()).orElseThrow(() => new Error(`command required to not be null`));
  const a = args ? args : parts;
  const commandString = `${c} ${a.join(' ')}`;

  log.info(`Executing command: '${commandString}' in dir: ${dir}`);

  const stdout = '';
  return new Promise((resolve, reject) => {
    const child = spawn(c, a, {
      cwd: dir,
      shell: true,
      stdio: 'inherit'
    });
    Optional.ofNullable(child.stdout).ifPresent(stdout => {
      stdout.on('data', data => {
        stdout += data.toString();
        console.log(data.toString().trim());
      });
    });
    child.on('exit', code => {
      if (Optional.ofNullable(code).orElse(1) > 0) {
        reject(`command: '${commandString}' in dir: ${dir}, exited with code: ${code}`);
      }
      resolve(stdout);
    });
  });
};

export const getRequiredEnvironmentVar = (key: string): string => {
  return Optional.ofNullable(process.env[key]).orElseThrow(() => new Error(`Required env var: ${key} was not set`));
};

export interface PackageJsonBlock {
  [key: string]: string;
}

export interface PackageJson {
  name: string;
  version: string;
  license: string;
  files: string[]
  engines: PackageJsonBlock;
  dependencies: PackageJsonBlock;
  devDependencies: PackageJsonBlock;
  optionalDependencies: PackageJsonBlock;
  resolutions: PackageJsonBlock;
}