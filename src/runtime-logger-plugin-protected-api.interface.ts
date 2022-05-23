/**
 * Exports Runtime Logger plugin protected API.
 *
 * @module
 */
import type { LogLevel } from '@agogpixel/pgmmv-logging-support/src/log-level.enum';
import type { PluginProtectedApi } from '@agogpixel/pgmmv-plugin-support/src/plugin-protected-api.interface';

import type { RuntimeLoggerPluginInternalData } from './runtime-logger-plugin-internal-data.type';

/**
 * Runtime Logger plugin protected API.
 */
export interface RuntimeLoggerPluginProtectedApi extends PluginProtectedApi<RuntimeLoggerPluginInternalData> {
  /**
   * Logger configuration.
   */
  loggerConfig: {
    /**
     * Log level.
     */
    logLevel: LogLevel;

    /**
     * JSON indent size.
     */
    jsonIndentSize: number;

    /**
     * JSON stringify functions.
     */
    jsonStringifyFunctions: boolean;

    /**
     * Write log files.
     */
    writeLogFiles: boolean;

    /**
     * Log files directory.
     */
    logFilesDirectory: string;
  };
}
