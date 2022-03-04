# Runtime Logger Plugin

Extends the `Agtk.log` method & provides the following:

-   Log level support.
-   Improved output of large strings to the player's "Runtime Log Console".
-   Automatically converts non-string arguments to a JSON string:
    -   Configurable indenting.
    -   Optional function stringify.
    -   Handles circular references.
-   Optional output of logs to the filesystem with log rotation (player only, see 'Notes').

These features can be leveraged in your other PGMMV plugins & scripts.

## Plugin Parameters

-   `Log Level`: One of `DEBUG < INFO < WARN < ERROR < FATAL`.
-   `JSON Indent Size`: Clamps with range [0,8]. Value of 0 will print on a single line.
-   `JSON Stringify Functions`: Specifiy when to log function bodies. One of `NEVER`, `DEBUG ONLY`, `ALWAYS`.
-   `Write Log Files`: Activate or deactivate copying logs to the local filesystem. Runs only when in player.
-   `Log Files Directory`: Directory path to be appended to `Agtk.settings.projectPath` value. This must result in a valid, absolute path.
    -   The primary log file is `current.log`; contents are rotated out to `yyyy-mm-dd-hh-ii-ss-uuu.log` files, where the date is the recorded batch start time.

## Example Usage

```js
// Same behavior as original `Agtk.log` method (always logs).
Agtk.log('Hello World!');

// Prints JSON representation of objectInstance.
Agtk.log(objectInstance);

// Only log this object's JSON representation if plugin's log level is set to DEBUG.
Agtk.log(someObject, 'Debug'); // 'Debug', 'Info', 'Warn', 'Error', 'Fatal'.

// Only log if plugin's log level is set to DEBUG.
Agtk.log.debug('debug message');

// Only log if plugin's log level is set to INFO or lower.
Agtk.log.info('info message');

// Only log if plugin's log level is set to WARN or lower.
Agtk.log.warn('warn message');

// Only log if plugin's log level is set to ERROR or lower.
Agtk.log.error('error message');

// Always logs.
Agtk.log.fatal('fatal message');
```

## Notes

-   **Writing Files**: The `jsb.fileUtils` API provides limited filesystem access with unreliable performance when tasked with
    multiple write requests to the same file within a short period of time.

    To help mitigate this issue, a simple shared/exclusive lock system is utilized to queue file reads & writes.
    Additional in memory buffering is performed to reduce write queues from building up too quickly.

    Also, file append operations are not supported in the `jsb.fileUtils`; we can either read from an entire file or
    create/overwrite a file. Thus, appending logs to a file is an expensive operation that increases with file size.
    Frequent 'rotation' of log files is utilized to keep the target log file to a reasonable size.
