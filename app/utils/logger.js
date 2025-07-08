/**
 * Logger configuration using Winston
 * Provides consistent logging across the application
 */
import winston from 'winston';

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Handle environments that don't support Winston transports
const createFallbackLogger = () => {
  return {
    error: (message, meta) => console.error(`ERROR: ${message}`, meta || ''),
    warn: (message, meta) => console.warn(`WARN: ${message}`, meta || ''),
    info: (message, meta) => console.info(`INFO: ${message}`, meta || ''),
    http: (message, meta) => console.log(`HTTP: ${message}`, meta || ''),
    debug: (message, meta) => console.debug(`DEBUG: ${message}`, meta || ''),
  };
};

// Create Winston logger or fallback
let logger;

try {
  // Define transports
  const transports = [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        format
      ),
    }),
    // Add file transports in production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format,
          }),
          new winston.transports.File({
            filename: 'logs/all.log',
            format,
          }),
        ]
      : []),
  ];

  // Create Winston logger
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
  });

  logger.info('Logger initialized');
} catch (error) {
  console.warn('Could not initialize Winston logger, using fallback:', error);
  logger = createFallbackLogger();
}

export default logger; 