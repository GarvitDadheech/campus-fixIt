import winston from 'winston';
import path from 'path';
import { env } from '../config/env';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Define log format for console (with colors)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Create transports array
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  }),
];

// Add file transports in production
if (env.NODE_ENV === 'production') {
  const logsDir = path.join(__dirname, '../../logs');
  
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports,
  exitOnError: false,
});

// Export logger methods
export const log = {
  info: (message: string, meta?: object) => logger.info(message, meta),
  error: (message: string, error?: Error | unknown, meta?: object) => {
    if (error instanceof Error) {
      logger.error(message, { stack: error.stack, ...meta });
    } else if (error) {
      logger.error(message, { error, ...meta });
    } else {
      logger.error(message, meta);
    }
  },
  warn: (message: string, meta?: object) => logger.warn(message, meta),
  debug: (message: string, meta?: object) => logger.debug(message, meta),
  http: (message: string, meta?: object) => logger.http(message, meta),
};

export default log;

