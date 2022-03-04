import { mixinFileManager } from '@agogpixel/pgmmv-fs-support/src/mixin-file-manager';
import { mixinFileReader } from '@agogpixel/pgmmv-fs-support/src/mixin-file-reader';
import { mixinFileWriter } from '@agogpixel/pgmmv-fs-support/src/mixin-file-writer';
import type { FileSystemOperationCallback } from '@agogpixel/pgmmv-fs-support/src/operation/callback';

import { getUnixTimestamp } from '@agogpixel/pgmmv-resource-support/src/time/get-unix-timestamp';
import { pollWithInterval } from '@agogpixel/pgmmv-resource-support/src/time/poll-with-interval';

import type { LogFilesManager } from './log-files-manager';
import type { LogFilesManagerConfig } from './log-files-manager-config';

/**
 *
 */
const targetLogFile = 'current.log';

/**
 *
 * @param config
 * @returns
 */
export function createLogFileManager(config: LogFilesManagerConfig) {
  /**
   *
   */
  const self = {} as LogFilesManager;

  /**
   *
   */
  const fsApi = mixinFileWriter(mixinFileReader(mixinFileManager({})));

  /**
   *
   */
  let logFilesDirectory = config.logFilesDirectory;

  /**
   *
   */
  let buffer: string[] | undefined;

  /**
   *
   */
  let batchStart: Date;

  /**
   *
   */
  let bufferSize: number;

  /**
   *
   */
  let lastWriteTime = getUnixTimestamp();

  /**
   *
   */
  let isWriting = false;

  /**
   *
   * @param basePath
   * @param relDirPath
   * @param callback
   * @returns
   */
  function createLogFilesDirectoryPath(basePath: string, relDirPath: string, callback: FileSystemOperationCallback) {
    if (!relDirPath) {
      callback(true);
      return;
    }

    const parts = relDirPath.split('/');
    const path = `${basePath}/${parts.shift()}`;

    if (fsApi.isDirectory(path)) {
      createLogFilesDirectoryPath(path, parts.join('/'), callback);
      return;
    }

    fsApi.createDirectory(path, function (success) {
      if (success) {
        createLogFilesDirectoryPath(path, parts.join('/'), callback);
        return;
      }

      callback(false);
    });
  }

  function writeToBuffer(data: string) {
    if (!buffer) {
      buffer = [];
      batchStart = new Date();
      bufferSize = 0;
    }

    buffer.push(data);
    bufferSize += data.length;

    if (bufferSize > 2048) {
      flushToFile(buffer, `${Agtk.settings.projectPath}${logFilesDirectory}/${targetLogFile}`);
    }
  }

  function flushToFile(buffer: string[], path: string) {
    if (isWriting) {
      return;
    }

    isWriting = true;

    function finish() {
      isWriting = false;
      lastWriteTime = getUnixTimestamp();
    }

    fsApi.appendFile(buffer.join('\n').trim(), path, function (success) {
      if (!success) {
        finish();
        return;
      }

      fsApi.readFileSize(path, function (success, data) {
        function pad2(n: number) {
          return (n < 10 ? '0' : '') + n;
        }

        function pad3(n: number) {
          return (n < 100 ? '0' : '') + pad2(n);
        }

        if (success && typeof data === 'number' && data >= 6144) {
          const filename = `${batchStart.getFullYear()}-${pad2(batchStart.getMonth() + 1)}-${pad2(
            batchStart.getDate()
          )}-${pad2(batchStart.getHours())}-${pad2(batchStart.getMinutes())}-${pad2(batchStart.getSeconds())}-${pad3(
            batchStart.getMilliseconds()
          )}.log`;

          batchStart = new Date();

          const rotateLog = `${Agtk.settings.projectPath}${logFilesDirectory}/${filename}`;

          fsApi.readFile(path, function (success, data) {
            if (success && data !== undefined) {
              fsApi.writeFile(data as string, rotateLog, function () {
                fsApi.writeFile('', path, finish);
              });
            } else {
              fsApi.writeFile('', path, finish);
            }
          });
        } else {
          finish();
        }
      });
    });

    buffer.length = 0;
    bufferSize = 0;
  }

  // Flush buffer timeout.
  pollWithInterval(
    function () {
      if (bufferSize > 2048 || getUnixTimestamp() - lastWriteTime > 3) {
        if (buffer && buffer.length) {
          flushToFile(buffer, `${Agtk.settings.projectPath}${logFilesDirectory}/${targetLogFile}`);
        }
      }
      return false;
    },
    function () {
      return;
    },
    function () {
      return;
    },
    4000
  );

  /**
   *
   * @returns
   */
  self.getLogFilesDirectory = function getLogFilesDirectory() {
    return logFilesDirectory;
  };

  /**
   *
   * @param relDirPath
   */
  self.setLogFilesDirectory = function setLogFilesDirectory(relDirPath) {
    logFilesDirectory = relDirPath;
    return self;
  };

  /**
   *
   * @param data
   * @param relDirPath
   * @returns
   */
  self.writeToLogFiles = function writeToLogFiles(data) {
    const logFilesDirectoryPath = `${Agtk.settings.projectPath}${logFilesDirectory}`;

    if (!fsApi.isAbsolutePath(logFilesDirectoryPath)) {
      return;
    }

    if (!fsApi.isDirectory(logFilesDirectoryPath)) {
      createLogFilesDirectoryPath(Agtk.settings.projectPath, logFilesDirectory, function (success) {
        if (success) {
          writeToBuffer(data);
        }
      });

      return;
    }

    writeToBuffer(data);
  };

  return self;
}
