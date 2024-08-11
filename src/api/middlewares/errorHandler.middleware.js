import { Prisma } from '@prisma/client';
import logger from '../../config/logger.js';

// Middleware for handling errors
export default function errorHandler(err, req, res, next) {
  logger.error(`An error occurred in ${req.method} ${req.path}: ${err.message}\n${err.stack}`);

  if (err.name === 'ZodError') {
    if (err.errors[0].message.includes('Required'))
      return res.status(400).json({ message: `Missing required field: ${err.errors[0].path}` });

    return res.status(400).json({ message: err.errors[0].message });
  }

  if (err instanceof NotFoundException)
    return res.status(err.statusCode).json({ message: err.message });

  if (err instanceof CustomError)
    return res.status(err.statusCode).json({ message: err.message });

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2003')
      return res.status(400).json({
        message: `The provided id(s) needed to create ${err.meta?.modelName} was not found`,
      });

    if (err.code === 'P2002')
      return res.status(400).json({
        message: `The following field(s) used to create ${err.meta?.modelName} is/are already taken: ${err.meta?.target}`
      });

    return res.status(400).json({ 
      message: err.meta ? 
        err.meta.cause : 
        err.message
    });
  }

  if (
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    const errorMessage = getErrorMessageFromPrismaError(err.message);
    return res.status(400).json({ message: errorMessage });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json({
      message: 'Unable to reach the database server',
    });
  }

  return res.status(500).json({
    message: 'Something went wrong',
    error: err.message,
  });
}

function getErrorMessageFromPrismaError(error) {
  const errorMessageParts = error.split('\n');
  return errorMessageParts[errorMessageParts.length - 1];
}
