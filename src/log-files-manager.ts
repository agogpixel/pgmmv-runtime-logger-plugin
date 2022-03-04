/**
 *
 */
export interface LogFilesManager {
  /**
   *
   */
  getLogFilesDirectory(): string;

  /**
   *
   * @param relDirPath
   */
  setLogFilesDirectory(relDirPath: string): this;

  /**
   *
   * @param data
   */
  writeToLogFiles(data: string): void;
}
