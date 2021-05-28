const winston = require('winston');
const moment = require('moment');

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.errors({ stack: true }), winston.format.json()),
  transports: [
    new winston.transports.File({
      filename: `${process.env.PASTA_LOGS}/${moment().format('YYYY_MM_DD')}_error.log`,
      level: 'error',
    }),
    new winston.transports.File({
      filename: `${process.env.PASTA_LOGS}/${moment().format('YYYY_MM_DD')}_info.log`,
      level: 'info',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

module.exports = logger;
