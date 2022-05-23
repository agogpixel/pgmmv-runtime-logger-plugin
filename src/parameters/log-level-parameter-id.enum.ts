/**
 * Exports log level parameter ID enumeration.
 *
 * @module
 */
import { LogLevel } from '@agogpixel/pgmmv-logging-support/src/log-level.enum';

/**
 * Log level parameter ID enumeration.
 */
export enum LogLevelParameterId {
  /**
   * Debug log level.
   */
  Debug = LogLevel.Debug,

  /**
   * Info log level.
   */
  Info = LogLevel.Info,

  /**
   * Warn log level.
   */
  Warn = LogLevel.Warn,

  /**
   * Error log level.
   */
  Error = LogLevel.Error,

  /**
   * Fatal log level.
   */
  Fatal = LogLevel.Fatal
}
