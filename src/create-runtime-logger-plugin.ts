declare const PLUGIN_VERSION: string;

import type { Logger } from '@agogpixel/pgmmv-logging-support/src/logger';
import { createLogger } from '@agogpixel/pgmmv-logging-support/src/create-logger';
import { LogLevel } from '@agogpixel/pgmmv-logging-support/src/log-level';

import type { PluginProtectedApi } from '@agogpixel/pgmmv-plugin-support/src/protected-api';
import { createPlugin } from '@agogpixel/pgmmv-plugin-support/src/create-plugin';

import { toJson } from '@agogpixel/pgmmv-resource-support/src/json/to-json';

import type { JsonValue } from '@agogpixel/pgmmv-ts/api/types';

import { createLogFileManager } from './create-log-files-manager';
import localizations from './locale';
import type { LogFilesManager } from './log-files-manager';
import { JsonStringifyFunctionsParameterId, ParameterId, parameters } from './parameters';
import type { RuntimeLogger } from './runtime-logger';

/**
 *
 */
type InternalData = JsonValue & {
  logLevel: LogLevel;
  jsonIndentSize: number;
  jsonStringifyFunctions: boolean;
  writeLogFiles: boolean;
  logFilesDirectory: string;
};

/**
 *
 */
const defaultLogLevel = LogLevel.Info;

/**
 *
 */
const defaultJsonIndentSize = 2;

/**
 *
 */
const defaultJsonStringifyFunctions = false;

/**
 *
 */
const defaultWriteLogFiles = false;

/**
 *
 */
const pluginBanner = `\nRuntime Logger Plugin v${PLUGIN_VERSION}\nCopyright 2022 AgogPixel - All Rights Reserved\n`;

/**
 *
 * @returns
 */
export function createRuntimeLoggerPlugin() {
  /**
   *
   */
  const internalApi = {} as PluginProtectedApi<InternalData>;

  /**
   *
   */
  const self = createPlugin<InternalData>({ localizations, parameters }, internalApi);

  /**
   *
   */
  let AgtkLog: typeof Agtk.log;

  /**
   *
   */
  let combinedLogger: Logger;

  /**
   *
   */
  let logFileManager: LogFilesManager;

  /**
   *
   */
  function initLogOverride() {
    AgtkLog = Agtk.log;

    logFileManager = createLogFileManager({
      logFilesDirectory: internalApi.internalData.logFilesDirectory
    });

    combinedLogger = createLogger({
      logLevel: internalApi.internalData.logLevel,
      runtimeLog: function (arg1) {
        const chunks = arg1.match(/.{1,120}/g) as string[];

        for (let i = 0; i < chunks.length; ++i) {
          AgtkLog(chunks[i]);
        }

        if (internalApi.inPlayer() && internalApi.internalData.writeLogFiles) {
          logFileManager.writeToLogFiles(arg1);
        }
      },
      jsonIndentSize: internalApi.internalData.jsonIndentSize,
      jsonStringifyFunctions: internalApi.internalData.jsonStringifyFunctions,
      logLevelMap: {
        [LogLevel.Debug]: internalApi.localization.get('LOG_LEVEL_0'),
        [LogLevel.Info]: internalApi.localization.get('LOG_LEVEL_1'),
        [LogLevel.Warn]: internalApi.localization.get('LOG_LEVEL_2'),
        [LogLevel.Error]: internalApi.localization.get('LOG_LEVEL_3'),
        [LogLevel.Fatal]: internalApi.localization.get('LOG_LEVEL_4')
      }
    });

    /**
     *
     */
    const logOverride = function logOverride(data, level?) {
      combinedLogger.log(data, level);
    } as RuntimeLogger;

    /**
     *
     * @param data
     * @param level
     */
    logOverride.log = function log(data, level?) {
      combinedLogger.log(data, level);
    };

    /**
     *
     * @param data
     */
    logOverride.debug = function debug(data) {
      combinedLogger.debug(data);
    };

    /**
     *
     * @param data
     */
    logOverride.info = function info(data) {
      combinedLogger.info(data);
    };

    /**
     *
     * @param data
     */
    logOverride.warn = function warn(data) {
      combinedLogger.warn(data);
    };

    /**
     *
     * @param data
     */
    logOverride.error = function error(data) {
      combinedLogger.error(data);
    };

    /**
     *
     * @param data
     */
    logOverride.fatal = function fatal(data) {
      combinedLogger.fatal(data);
    };

    Agtk.log = logOverride;
  }

  /**
   *
   * @param data
   */
  self.initialize = function initialize(data) {
    if (!data) {
      data = {
        logLevel: defaultLogLevel,
        jsonIndentSize: defaultJsonIndentSize,
        jsonStringifyFunctions: defaultJsonStringifyFunctions,
        writeLogFiles: defaultWriteLogFiles,
        logFilesDirectory: internalApi.localization.get('PARAMETER_4_DEFAULT_VALUE')
      };
    }

    self.setInternal(data);

    if (internalApi.inEditor()) {
      return;
    }

    initLogOverride();

    combinedLogger.info(`${pluginBanner}${toJson(internalApi.internalData)}`);
  };

  /**
   *
   */
  self.finalize = function finalize() {
    if (internalApi.inEditor()) {
      return;
    }

    Agtk.log = AgtkLog;
  };

  /**
   *
   * @param paramValue
   * @returns
   */
  self.setParamValue = function setParamValue(paramValue) {
    if (!paramValue || !paramValue.length) {
      return;
    }

    for (let i = 0; i < paramValue.length; ++i) {
      switch (paramValue[i].id) {
        case ParameterId.LogLevel:
          internalApi.internalData.logLevel = paramValue[i].value as LogLevel;
          break;
        case ParameterId.JsonIndentSize:
          internalApi.internalData.jsonIndentSize = paramValue[i].value as number;
          break;
        case ParameterId.JsonStringifyFunctions:
          // Assumes Log Level updated first.
          const mode = paramValue[i].value as number;

          if (
            !mode ||
            (mode === JsonStringifyFunctionsParameterId.DebugOnly &&
              internalApi.internalData.logLevel !== LogLevel.Debug)
          ) {
            internalApi.internalData.jsonStringifyFunctions = false;
          } else {
            internalApi.internalData.jsonStringifyFunctions = true;
          }

          break;
        case ParameterId.WriteLogFiles:
          internalApi.internalData.writeLogFiles = !!(paramValue[i].value as number);
          break;
        case ParameterId.LogFilesDirectory:
          const rawDir = (paramValue[i].value as string).trim();

          if (rawDir) {
            const rawDirParts = rawDir.replace(/\\/g, '/').split(/\//);
            const dirParts: string[] = [];

            let invalid = false;

            for (let i = 0; i < rawDirParts.length; ++i) {
              const p = rawDirParts[i].trim();

              if (/(<|>|:|"|\||\?|\*|^\.$|^\.\.$)/.test(p)) {
                invalid = true;
                break;
              }

              if (p) {
                dirParts.push(p);
              }
            }

            if (!invalid && dirParts.length) {
              internalApi.internalData.logFilesDirectory = dirParts.join('/');
            }
          }

          break;
      }
    }

    if (internalApi.inEditor()) {
      return;
    }

    combinedLogger
      .setLogLevel(internalApi.internalData.logLevel)
      .setJsonIndentSize(internalApi.internalData.jsonIndentSize)
      .setJsonStringifyFunctions(internalApi.internalData.jsonStringifyFunctions);
  };

  return self;
}
