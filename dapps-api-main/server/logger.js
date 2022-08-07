const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({
      filename: __dirname + "/../logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: __dirname + "/../logs/combined.log",
    }),
  ],
});
const opts = {
  filename: "application-%DATE%.log",
  dirname: __dirname + "/../logs",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "300m",
  maxFiles: "150d",
};

const DailyRotateFile = require("winston-daily-rotate-file");
logger.configure({
  level: "info",
  transports: [new DailyRotateFile(opts)],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
