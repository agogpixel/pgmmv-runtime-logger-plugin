import { LogLevel } from '@agogpixel/pgmmv-logging-support/src/log-level';
import type { AgtkPluginUiParameter } from '@agogpixel/pgmmv-ts/api/agtk/plugin/plugin-ui-parameter';
import { AgtkPluginUiParameterType } from '@agogpixel/pgmmv-ts/api/agtk/plugin/plugin-ui-parameter-type';

/**
 *
 */
export enum ParameterId {
  /**
   *
   */
  LogLevel = 0xbcc800,

  /**
   *
   */
  JsonIndentSize,

  /**
   *
   */
  JsonStringifyFunctions,

  /**
   *
   */
  WriteLogFiles,

  /**
   *
   */
  LogFilesDirectory
}

/**
 *
 */
export const LogLevelParameterId = LogLevel;

/**
 *
 */
export enum JsonStringifyFunctionsParameterId {
  /**
   *
   */
  Never,

  /**
   *
   */
  DebugOnly,

  /**
   *
   */
  Always
}

/**
 *
 */
export enum WriteLogFilesParameterId {
  /**
   *
   */
  Off,

  /**
   *
   */
  On
}

export const parameters: AgtkPluginUiParameter[] = [
  {
    id: ParameterId.LogLevel,
    name: 'loca(PARAMETER_0_NAME)',
    type: AgtkPluginUiParameterType.CustomId,
    customParam: [
      { id: LogLevelParameterId.Debug, name: 'loca(PARAMETER_0_PARAM_0_NAME)' },
      { id: LogLevelParameterId.Info, name: 'loca(PARAMETER_0_PARAM_1_NAME)' },
      { id: LogLevelParameterId.Warn, name: 'loca(PARAMETER_0_PARAM_2_NAME)' },
      { id: LogLevelParameterId.Error, name: 'loca(PARAMETER_0_PARAM_3_NAME)' },
      { id: LogLevelParameterId.Fatal, name: 'loca(PARAMETER_0_PARAM_4_NAME)' }
    ],
    defaultValue: LogLevelParameterId.Info
  },
  {
    id: ParameterId.JsonIndentSize,
    name: 'loca(PARAMETER_1_NAME)',
    type: AgtkPluginUiParameterType.Number,
    minimumValue: 0,
    maximumValue: 8,
    defaultValue: 2
  },
  {
    id: ParameterId.JsonStringifyFunctions,
    name: 'loca(PARAMETER_2_NAME)',
    type: AgtkPluginUiParameterType.CustomId,
    customParam: [
      { id: JsonStringifyFunctionsParameterId.Never, name: 'loca(PARAMETER_2_PARAM_0_NAME)' },
      { id: JsonStringifyFunctionsParameterId.DebugOnly, name: 'loca(PARAMETER_2_PARAM_1_NAME)' },
      { id: JsonStringifyFunctionsParameterId.Always, name: 'loca(PARAMETER_2_PARAM_2_NAME)' }
    ],
    defaultValue: JsonStringifyFunctionsParameterId.DebugOnly
  },
  {
    id: ParameterId.WriteLogFiles,
    name: 'loca(PARAMETER_3_NAME)',
    type: AgtkPluginUiParameterType.CustomId,
    customParam: [
      { id: WriteLogFilesParameterId.Off, name: 'loca(PARAMETER_3_PARAM_0_NAME)' },
      { id: WriteLogFilesParameterId.On, name: 'loca(PARAMETER_3_PARAM_1_NAME)' }
    ],
    defaultValue: WriteLogFilesParameterId.Off
  },
  {
    id: ParameterId.LogFilesDirectory,
    name: 'loca(PARAMETER_4_NAME)',
    type: AgtkPluginUiParameterType.String,
    defaultValue: 'loca(PARAMETER_4_DEFAULT_VALUE)'
  }
];
