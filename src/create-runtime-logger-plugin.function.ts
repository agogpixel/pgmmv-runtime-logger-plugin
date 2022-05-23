/**
 * Exports a Runtime Logger plugin instance factory.
 *
 * @module
 */
import type { Logger } from '@agogpixel/pgmmv-logging-support/src/logger.interface';
import { createLogger } from '@agogpixel/pgmmv-logging-support/src/create-logger.function';
import { LogLevel } from '@agogpixel/pgmmv-logging-support/src/log-level.enum';
import { createPlugin } from '@agogpixel/pgmmv-plugin-support/src/create-plugin.function';
import type { AgtkPluginParameterValue } from '@agogpixel/pgmmv-ts/api/agtk/plugin/plugin-parameter-value';

import localizations from './locale';
import { createLogFilesManager, LogFilesManager } from './log-files-manager';
import { JsonStringifyFunctionsParameterId, ParameterId, parameters, WriteLogFilesParameterId } from './parameters';
import type { RuntimeLoggerPluginInternalData } from './runtime-logger-plugin-internal-data.type';
import type { RuntimeLoggerPluginProtectedApi } from './runtime-logger-plugin-protected-api.interface';
import type { RuntimeLogger } from './runtime-logger.type';

////////////////////////////////////////////////////////////////////////////////
// Public Static Properties
////////////////////////////////////////////////////////////////////////////////

// None.

////////////////////////////////////////////////////////////////////////////////
// Private Static Properties
////////////////////////////////////////////////////////////////////////////////

/**
 * Plugin sematic version. Variable must exist in current scope.
 *
 * @private
 * @static
 */
declare const PLUGIN_VERSION: string;

/**
 * Plugin banner.
 *
 * @private
 * @static
 */
const pluginBanner = `\nRuntime Logger Plugin v${PLUGIN_VERSION}\n`;

////////////////////////////////////////////////////////////////////////////////
// Public Static Methods
////////////////////////////////////////////////////////////////////////////////

/**
 * Create a Runtime Logger plugin instance.
 *
 * @returns Runtime Logger plugin instance.
 * @public
 * @static
 */
export function createRuntimeLoggerPlugin() {
  // Protected API container.
  const internalApi = {} as RuntimeLoggerPluginProtectedApi;

  // Public API container.
  const self = createPlugin<RuntimeLoggerPluginInternalData>({ localizations, parameters }, internalApi);

  //////////////////////////////////////////////////////////////////////////////
  // Private Properties
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Reference to original `Agtk.log` method.
   *
   * @private
   */
  let AgtkLog: typeof Agtk.log;

  /**
   * Reference to logger that outputs to console & file.
   *
   * @private
   */
  let combinedLogger: Logger;

  /**
   * Reference to log files manager.
   *
   * @private
   */
  let logFilesManager: LogFilesManager;

  //////////////////////////////////////////////////////////////////////////////
  // Private Methods
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Initialize combined logger and override `Agtk.log` method.
   *
   * @private
   */
  function initLogOverride() {
    // Set default values.
    setLoggerConfig();

    AgtkLog = Agtk.log;

    logFilesManager = createLogFilesManager({
      logFilesDirectory: internalApi.loggerConfig.logFilesDirectory
    });

    combinedLogger = createLogger({
      logLevel: internalApi.loggerConfig.logLevel,
      runtimeLog: function (arg1) {
        const chunks = arg1.match(/.{1,120}/g) as string[];

        for (let i = 0; i < chunks.length; ++i) {
          AgtkLog(chunks[i]);
        }

        if (internalApi.inPlayer() && internalApi.loggerConfig.writeLogFiles) {
          logFilesManager.writeToLogFiles(arg1);
        }
      },
      jsonIndentSize: internalApi.loggerConfig.jsonIndentSize,
      jsonStringifyFunctions: internalApi.loggerConfig.jsonStringifyFunctions,
      logLevelMap: {
        [LogLevel.Debug]: internalApi.localization.get('LOG_LEVEL_DEBUG'),
        [LogLevel.Info]: internalApi.localization.get('LOG_LEVEL_INFO'),
        [LogLevel.Warn]: internalApi.localization.get('LOG_LEVEL_WARN'),
        [LogLevel.Error]: internalApi.localization.get('LOG_LEVEL_ERROR'),
        [LogLevel.Fatal]: internalApi.localization.get('LOG_LEVEL_FATAL')
      }
    });

    const logOverride = function (data, level?) {
      combinedLogger.log(data, level);
    } as RuntimeLogger;

    logOverride.log = function (data, level?) {
      combinedLogger.log(data, level);
    };

    logOverride.debug = function (data) {
      combinedLogger.debug(data);
    };

    logOverride.info = function (data) {
      combinedLogger.info(data);
    };

    logOverride.warn = function (data) {
      combinedLogger.warn(data);
    };

    logOverride.error = function (data) {
      combinedLogger.error(data);
    };

    logOverride.fatal = function (data) {
      combinedLogger.fatal(data);
    };

    Agtk.log = logOverride;
  }

  /**
   * Set logger configuration using specified UI parameter values.
   *
   * @param paramValue Plugin UI parameter values.
   * @private
   */
  function setLoggerConfig(paramValue: AgtkPluginParameterValue[] = []) {
    const normalizedUiParameters = internalApi.normalizeUiParameters(paramValue);

    const logLevel = normalizedUiParameters[ParameterId.LogLevel] as LogLevel;
    const jsonIndentSize = normalizedUiParameters[ParameterId.JsonIndentSize] as number;

    const jsonStringifyFunctionsParamValue = normalizedUiParameters[ParameterId.JsonStringifyFunctions] as number;
    const jsonStringifyFunctions =
      jsonStringifyFunctionsParamValue === JsonStringifyFunctionsParameterId.Always ||
      (jsonStringifyFunctionsParamValue === JsonStringifyFunctionsParameterId.DebugOnly && logLevel === LogLevel.Debug);

    const writeLogFiles = (normalizedUiParameters[ParameterId.WriteLogFiles] as number) === WriteLogFilesParameterId.On;

    const logFilesDirectoryParamValue = (normalizedUiParameters[ParameterId.LogFilesDirectory] as string).trim();
    let logFilesDirectory = '';

    if (logFilesDirectoryParamValue) {
      const rawDirParts = logFilesDirectoryParamValue.replace(/\\/g, '/').split(/\//);
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
        logFilesDirectory = dirParts.join('/');
      }
    }

    internalApi.loggerConfig = {
      logLevel,
      jsonIndentSize,
      jsonStringifyFunctions,
      logFilesDirectory,
      writeLogFiles
    };

    if (!combinedLogger || !logFilesManager) {
      return;
    }

    combinedLogger
      .setLogLevel(logLevel)
      .setJsonIndentSize(jsonIndentSize)
      .setJsonStringifyFunctions(jsonStringifyFunctions);

    logFilesManager.setLogFilesDirectory(logFilesDirectory);
  }

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

  const _initialize = self.initialize;
  self.initialize = function (data) {
    _initialize(data);

    if (internalApi.inEditor()) {
      return;
    }

    initLogOverride();

    combinedLogger.log(pluginBanner);
  };

  self.finalize = function () {
    if (internalApi.inEditor()) {
      return;
    }

    Agtk.log = AgtkLog;
  };

  self.setParamValue = function (paramValue) {
    if (internalApi.inEditor()) {
      return;
    }

    setLoggerConfig(paramValue);
  };

  // Plugin is ready!
  return self;
}

////////////////////////////////////////////////////////////////////////////////
// Private Static Methods
////////////////////////////////////////////////////////////////////////////////

// None.
