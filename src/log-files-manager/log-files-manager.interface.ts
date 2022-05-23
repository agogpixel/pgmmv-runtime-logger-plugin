/**
 * Exports log files manager API.
 *
 * @module
 */

/**
 * Log files manager API.
 */
export interface LogFilesManager {
  /**
   * Get log files directory path.
   *
   * @returns Log files directory path.
   */
  getLogFilesDirectory(): string;

  /**
   * Set log files directory path.
   *
   * @param relDirPath Relative directory path.
   * @returns Reference to log files manager to facilitate method chaining.
   */
  setLogFilesDirectory(relDirPath: string): this;

  /**
   * Write data to log files.
   *
   * @param data Data to write.
   */
  writeToLogFiles(data: string): void;
}
