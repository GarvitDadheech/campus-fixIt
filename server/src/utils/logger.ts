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
  info: (message: string, meta?: object) => {
    if (meta && Object.keys(meta).length > 0) {
      // Format metadata for better readability
      const metaStr = Object.entries(meta)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(', ');
      logger.info(`${message} | ${metaStr}`);
    } else {
      logger.info(message);
    }
  },
  error: (message: string, error?: Error | unknown, meta?: object) => {
    if (error instanceof Error) {
      const errorMeta = { stack: error.stack, message: error.message, ...meta };
      const metaStr = Object.entries(errorMeta)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(', ');
      logger.error(`${message} | ${metaStr}`);
    } else if (error) {
      const metaStr = Object.entries({ error, ...meta })
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(', ');
      logger.error(`${message} | ${metaStr}`);
    } else if (meta && Object.keys(meta).length > 0) {
      const metaStr = Object.entries(meta)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(', ');
      logger.error(`${message} | ${metaStr}`);
    } else {
      logger.error(message);
    }
  },
  warn: (message: string, meta?: object) => {
    if (meta && Object.keys(meta).length > 0) {
      const metaStr = Object.entries(meta)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(', ');
      logger.warn(`${message} | ${metaStr}`);
    } else {
      logger.warn(message);
    }
  },
  debug: (message: string, meta?: object) => {
    if (meta && Object.keys(meta).length > 0) {
      const metaStr = Object.entries(meta)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(', ');
      logger.debug(`${message} | ${metaStr}`);
    } else {
      logger.debug(message);
    }
  },
  http: (message: string, meta?: object) => {
    if (meta && Object.keys(meta).length > 0) {
      const metaStr = Object.entries(meta)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(', ');
      logger.http(`${message} | ${metaStr}`);
    } else {
      logger.http(message);
    }
  },
};

export default log;

