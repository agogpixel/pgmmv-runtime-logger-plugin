/**
 * Exports Runtime Logger type.
 *
 * @module
 */
import type { Logger } from '@agogpixel/pgmmv-logging-support/src/logger.interface';

/**
 * Runtime Logger type.
 */
export type RuntimeLogger = Logger['log'] & Logger;
