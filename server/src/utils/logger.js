/**
 * Centralized Logger Utility
 * Replaces scattered console.log calls with structured logging
 * Levels: debug, info, warn, error
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const getColorForLevel = (level) => {
  switch (level) {
    case LOG_LEVELS.DEBUG:
      return colors.cyan
    case LOG_LEVELS.INFO:
      return colors.blue
    case LOG_LEVELS.WARN:
      return colors.yellow
    case LOG_LEVELS.ERROR:
      return colors.red
    default:
      return colors.reset
  }
}

const getTimestamp = () => {
  const now = new Date()
  return now.toISOString()
}

const formatLog = (level, component, message, data = null) => {
  const timestamp = getTimestamp()
  const color = getColorForLevel(level)
  const dataStr = data ? ` | ${JSON.stringify(data)}` : ''

  return `${color}[${timestamp}] [${level}] [${component}]${colors.reset} ${message}${dataStr}`
}

class Logger {
  constructor(componentName = 'App') {
    this.componentName = componentName
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog(LOG_LEVELS.DEBUG, this.componentName, message, data))
    }
  }

  info(message, data = null) {
    console.log(formatLog(LOG_LEVELS.INFO, this.componentName, message, data))
  }

  warn(message, data = null) {
    console.warn(formatLog(LOG_LEVELS.WARN, this.componentName, message, data))
  }

  error(message, error = null) {
    const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error
    console.error(formatLog(LOG_LEVELS.ERROR, this.componentName, message, errorData))
  }
}

export default Logger
