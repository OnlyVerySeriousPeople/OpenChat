import fs from 'node:fs';
import path from 'node:path';

import formatDateFromTimestamp from '../utils/formatDateFromTimestamp.js';

const RED_COLOR = '\x1b[31m';
const DEFAULT_DIR_FOR_LOGS = path.join(process.cwd(), 'log_files');
const DEFAULT_BASE_OF_FILE = 'logs';
const DEFAULT_BUFFER_SIZE = 100;

class Logger {
  constructor(config) {
    const { useConsole, useFile, dirForFiles } = config;
    const { fileNameBase, bufferSize } = config;
    if (useFile) {
      this.dirPath = dirForFiles || DEFAULT_DIR_FOR_LOGS;
      this.fileNameBase = fileNameBase || DEFAULT_BASE_OF_FILE;
    }
    this.useFile = useFile;
    this.console = useConsole ? process.stdout : null;
    this.active = false;
    this.file = null;
    this.stream = null;
    this.buffer = [];
    this.bufferLength = 0;
    this.writeBuffer = bufferSize || DEFAULT_BUFFER_SIZE;
    this.dateOnFile = '';
    this.open();
  }

  open() {
    if (this.active) return;
    this.active = true;
    if (!this.useFile) return;
    this.createLogDir();
    this.createNewFile();
  }

  error(message) {
    const currentDate = this.checkCurrentDate();
    const lineInConsole = `${RED_COLOR}${currentDate} ${message}\x1b[0m`;
    const lineInFile = `${currentDate} ERROR: ${message}`;
    this.write(lineInConsole, lineInFile);
  }

  info(message) {
    const currentDate = this.checkCurrentDate();
    const lineInConsole = `${currentDate} ${message}\x1b[0m`;
    const lineInFile = `${currentDate} INFO: ${message}`;
    this.write(lineInConsole, lineInFile);
  }

  write(lineInConsole, lineInFile) {
    if (this.console) {
      this.console.write(`${lineInConsole}\n`);
    }
    if (this.useFile) {
      const buffer = Buffer.from(`${lineInFile}\n`);
      this.buffer.push(buffer);
      this.bufferLength += buffer.length;
      if (this.bufferLength >= this.writeBuffer) this.flush();
    }
  }

  createLogDir() {
    try {
      fs.accessSync(this.dirPath);
    } catch (err) {
      try {
        fs.mkdirSync(this.dirPath);
      } catch (fileCreatingErr) {
        if (fileCreatingErr.code !== 'EEXIST') {
          const error = new Error(
            `Can not create directory: ${this.dirPath}\n`,
          );
          process.stdout.write(`${RED_COLOR}Logger: ${error}\x1b[0m\n`);
          throw fileCreatingErr;
        }
      }
    }
  }

  flush() {
    if (this.buffer.length === 0) {
      return;
    }
    if (!this.active) {
      const err = new Error('Cannot flush log buffer: logger is not opened');
      process.stdout.write(`${RED_COLOR}Logger: ${err}\x1b[0m\n`);
      return;
    }
    const buffer = Buffer.concat(this.buffer);
    this.buffer.length = 0;
    this.bufferLength = 0;
    this.stream.write(buffer);
  }

  checkCurrentDate() {
    const currentDate = formatDateFromTimestamp(Date.now());
    const isSameDay =
      currentDate[0] !== this.dateOnFile[0] &&
      currentDate[1] !== this.dateOnFile[1];
    if (!isSameDay) {
      this.createNewFile();
    }
    return currentDate;
  }

  createNewFile() {
    if (this.stream) {
      this.stream.end();
    }
    this.dateOnFile = formatDateFromTimestamp(Date.now())
      .slice(0, 8)
      .replace(/\./g, '-');
    const fileName = `${this.fileNameBase}-${this.dateOnFile}.log`;
    this.file = path.join(this.dirPath, fileName);
    this.stream = fs.createWriteStream(this.file, { flags: 'a' });
  }

  close() {
    if (!this.active) return;
    this.flush();
    if (this.stream) {
      this.stream.end();
    }
    this.active = false;
  }
}

export default Logger;
