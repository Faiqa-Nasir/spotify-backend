import winston from 'winston';

// Define the log format
const format = winston.format.combine(
  winston.format.timestamp({
    format: 'DD-MM-YYYY HH:mm:ss A',
  }),
  winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] [${level}] ${message}`)
);

// Create the logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), 
        format
      ),
    }),
    new winston.transports.File({
      filename: 'combined.log',
      format,
    }),
  ],
});

// Log a message indicating that the logger has been initialized
logger.info('Logger initialized');

export default logger;
