/**
 * Logging Configuration
 * Features:
 * - Console and file logging
 * - Timestamp formatting
 * - Log level management
 * - Error stack traces
 */
const { createLogger, format, transports } = require('winston');

/**
 * Logger instance with console and file transports
 * @type {import('winston').Logger}
 */
const logger = createLogger({
  level: 'info',

  // Combine timestamp and message formatting
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} → ${message}`;
    })
  ),
  // Console and file transports
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/execution.log' })
  ]
});

module.exports = logger;
