/**
 * Exports a log files manager instance factory.
 *
 * @module
 */
import { mixinFileManager } from '@agogpixel/pgmmv-fs-support/src/mixin-file-manager.function';
import { mixinFileReader } from '@agogpixel/pgmmv-fs-support/src/mixin-file-reader.function';
import { mixinFileWriter } from '@agogpixel/pgmmv-fs-support/src/mixin-file-writer.function';
import type { FileSystemOperationCallback } from '@agogpixel/pgmmv-fs-support/src/file-system-module/operations/file-system-operation-callback.type';

import { getUnixTimestamp } from '@agogpixel/pgmmv-resource-support/src/time/get-unix-timestamp.function';
import { pollWithInterval } from '@agogpixel/pgmmv-resource-support/src/time/poll-with-interval.function';

import type { LogFilesManagerConfig } from './log-files-manager-config.interface';
import type { LogFilesManager } from './log-files-manager.interface';

////////////////////////////////////////////////////////////////////////////////
// Public Static Properties
////////////////////////////////////////////////////////////////////////////////

// None.

////////////////////////////////////////////////////////////////////////////////
// Private Static Properties
////////////////////////////////////////////////////////////////////////////////

/**
 * Target log filename.
 *
 * @private
 * @static
 */
const targetLogFile = 'current.log';

////////////////////////////////////////////////////////////////////////////////
// Public Static Methods
////////////////////////////////////////////////////////////////////////////////

/**
 * Create log files manager.
 *
 * @param config Log files manager configuration.
 * @returns Log file manager instance.
 * @public
 * @static
 */
export function createLogFilesManager(config: LogFilesManagerConfig) {
  // Public API container.
  const self = {} as LogFilesManager;

  //////////////////////////////////////////////////////////////////////////////
  // Private Properties
  //////////////////////////////////////////////////////////////////////////////

  /**
   * File system API.
   *
   * @private
   */
  const fsApi = mixinFileWriter(mixinFileReader(mixinFileManager({})));

  /**
   * Log files directory.
   *
   * @private
   */
  let logFilesDirectory = config.logFilesDirectory;

  /**
   * Write buffer.
   *
   * @private
   */
  let buffer: string[] | undefined;

  /**
   * Log batch state date.
   *
   * @private
   */
  let batchStart: Date;

  /**
   * Write buffer size.
   *
   * @private
   */
  let bufferSize: number;

  /**
   * Last write unix timestamp.
   *
   * @private
   */
  let lastWriteTime = getUnixTimestamp();

  /**
   * Is writing flag.
   *
   * @private
   */
  let isWriting = false;

  //////////////////////////////////////////////////////////////////////////////
  // Private Methods
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create log files directory path.
   *
   * @param basePath Base path.
   * @param relDirPath Relative directory path.
   * @param callback File system operation callback.
   * @private
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

  /**
   * Write to buffer.
   *
   * @param data Data to write.
   * @private
   */
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

  /**
   * Flush data in write buffer to file.
   *
   * @param buffer Buffer containing data to flush.
   * @param path Path to file.
   * @private
   */
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

  //////////////////////////////////////////////////////////////////////////////
  // Protected Properties
  //////////////////////////////////////////////////////////////////////////////

  // None.

  //////////////////////////////////////////////////////////////////////////////
  // Protected Methods
  //////////////////////////////////////////////////////////////////////////////

  // None.

  //////////////////////////////////////////////////////////////////////////////
  // Public Properties
  //////////////////////////////////////////////////////////////////////////////

  // None.

  //////////////////////////////////////////////////////////////////////////////
  // Public Methods
  //////////////////////////////////////////////////////////////////////////////

  self.getLogFilesDirectory = function () {
    return logFilesDirectory;
  };

  self.setLogFilesDirectory = function (relDirPath) {
    logFilesDirectory = relDirPath;
    return self;
  };

  self.writeToLogFiles = function (data) {
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

  // Log files manager ready!
  return self;
}

////////////////////////////////////////////////////////////////////////////////
// Private Static Methods
////////////////////////////////////////////////////////////////////////////////

// None.
