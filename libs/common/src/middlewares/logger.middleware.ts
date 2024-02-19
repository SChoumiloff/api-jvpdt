import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
const DailyRotateFile = require('winston-daily-rotate-file');

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      levels: winston.config.npm.levels,
      transports: [
        new DailyRotateFile({
          level: 'info',
          filename: './logs/jvpdt-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new winston.transports.Console({
          level: 'debug',
        }),
      ],
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode } = res;
      const clientIp =
        req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const message = `${method} ${originalUrl} ${statusCode} - IP: ${clientIp}`;

      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.info(message);
      }
    });

    next();
  }
}
