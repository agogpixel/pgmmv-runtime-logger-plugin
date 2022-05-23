/**
 * Exports Runtime Logger UI parameter configuration.
 *
 * @module
 */
import type { AgtkPluginUiParameter } from '@agogpixel/pgmmv-ts/api/agtk/plugin/plugin-ui-parameter';
import { AgtkPluginUiParameterType } from '@agogpixel/pgmmv-ts/api/agtk/plugin/plugin-ui-parameter-type';

import { JsonStringifyFunctionsParameterId } from './json-stringify-functions-parameter-id.enum';
import { LogLevelParameterId } from './log-level-parameter-id.enum';
import { ParameterId } from './parameter-id.enum';
import { WriteLogFilesParameterId } from './write-log-files-parameter-id.enum';

/**
 * Runtime Logger UI parameter configuration.
 */
export const parameters: AgtkPluginUiParameter[] = [
  {
    id: ParameterId.LogLevel,
    name: 'loca(PARAMETER_LOG_LEVEL_NAME)',
    type: AgtkPluginUiParameterType.CustomId,
    customParam: [
      { id: LogLevelParameterId.Debug, name: 'loca(PARAMETER_LOG_LEVEL_PARAM_DEBUG_NAME)' },
      { id: LogLevelParameterId.Info, name: 'loca(PARAMETER_LOG_LEVEL_PARAM_INFO_NAME)' },
      { id: LogLevelParameterId.Warn, name: 'loca(PARAMETER_LOG_LEVEL_PARAM_WARN_NAME)' },
      { id: LogLevelParameterId.Error, name: 'loca(PARAMETER_LOG_LEVEL_PARAM_ERROR_NAME)' },
      { id: LogLevelParameterId.Fatal, name: 'loca(PARAMETER_LOG_LEVEL_PARAM_FATAL_NAME)' }
    ],
    defaultValue: LogLevelParameterId.Info
  },
  {
    id: ParameterId.JsonIndentSize,
    name: 'loca(PARAMETER_JSON_INDENT_SIZE_NAME)',
    type: AgtkPluginUiParameterType.Number,
    minimumValue: 0,
    maximumValue: 8,
    defaultValue: 2
  },
  {
    id: ParameterId.JsonStringifyFunctions,
    name: 'loca(PARAMETER_JSON_STRINGIFY_FUNCTIONS_NAME)',
    type: AgtkPluginUiParameterType.CustomId,
    customParam: [
      {
        id: JsonStringifyFunctionsParameterId.Never,
        name: 'loca(PARAMETER_JSON_STRINGIFY_FUNCTIONS_PARAM_NEVER_NAME)'
      },
      {
        id: JsonStringifyFunctionsParameterId.DebugOnly,
        name: 'loca(PARAMETER_JSON_STRINGIFY_FUNCTIONS_PARAM_DEBUG_ONLY_NAME)'
      },
      {
        id: JsonStringifyFunctionsParameterId.Always,
        name: 'loca(PARAMETER_JSON_STRINGIFY_FUNCTIONS_PARAM_ALWAYS_NAME)'
      }
    ],
    defaultValue: JsonStringifyFunctionsParameterId.DebugOnly
  },
  {
    id: ParameterId.WriteLogFiles,
    name: 'loca(PARAMETER_WRITE_LOG_FILES_NAME)',
    type: AgtkPluginUiParameterType.CustomId,
    customParam: [
      { id: WriteLogFilesParameterId.Off, name: 'loca(PARAMETER_WRITE_LOG_FILES_PARAM_OFF_NAME)' },
      { id: WriteLogFilesParameterId.On, name: 'loca(PARAMETER_WRITE_LOG_FILES_PARAM_ON_NAME)' }
    ],
    defaultValue: WriteLogFilesParameterId.Off
  },
  {
    id: ParameterId.LogFilesDirectory,
    name: 'loca(PARAMETER_LOG_FILES_DIRECTORY_NAME)',
    type: AgtkPluginUiParameterType.String,
    defaultValue: 'loca(PARAMETER_LOG_FILES_DIRECTORY_DEFAULT_VALUE)'
  }
];
