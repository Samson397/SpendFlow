/**
 * Professional logging system for SpendFlow
 * Provides structured logging with different levels and transports
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  error?: Error;
  stack?: string;
}

export interface LogTransport {
  log(entry: LogEntry): void;
}

class ConsoleTransport implements LogTransport {
  log(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] ${levelName}`;

    const logData = {
      message: entry.message,
      context: entry.context,
      userId: entry.userId,
      sessionId: entry.sessionId,
      error: entry.error?.message,
      stack: entry.error?.stack,
    };

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, logData);
        break;
      case LogLevel.INFO:
        console.info(prefix, logData);
        break;
      case LogLevel.WARN:
        console.warn(prefix, logData);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, logData);
        break;
    }
  }
}

class MemoryTransport implements LogTransport {
  private logs: LogEntry[] = [];
  private maxEntries = 1000;

  log(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the most recent entries
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

// In production, you might add:
// - FileTransport (writes to files)
// - RemoteTransport (sends to logging service like DataDog, LogRocket)
// - DatabaseTransport (stores in database)

class Logger {
  private transports: LogTransport[] = [];
  private context: Record<string, any> = {};
  private minLevel: LogLevel = LogLevel.INFO;

  constructor() {
    // Add console transport by default
    this.addTransport(new ConsoleTransport());

    // Add memory transport for development/debugging
    if (process.env.NODE_ENV === 'development') {
      this.addTransport(new MemoryTransport());
    }

    // Set appropriate log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.minLevel = LogLevel.DEBUG;
    } else if (process.env.NODE_ENV === 'production') {
      this.minLevel = LogLevel.WARN;
    }
  }

  addTransport(transport: LogTransport): Logger {
    this.transports.push(transport);
    return this;
  }

  setContext(context: Record<string, any>): Logger {
    this.context = { ...this.context, ...context };
    return this;
  }

  setMinLevel(level: LogLevel): Logger {
    this.minLevel = level;
    return this;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private createEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: { ...this.context, ...context },
    };

    if (error) {
      entry.error = error;
      entry.stack = error.stack;
    }

    return entry;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createEntry(level, message, context, error);

    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (transportError) {
        // Don't let transport errors break the app
        console.error('Logging transport error:', transportError);
      }
    });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Utility methods for common logging scenarios
  userAction(action: string, userId: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, { ...context, userId, action });
  }

  apiRequest(method: string, path: string, statusCode: number, duration: number, context?: Record<string, any>): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `API ${method} ${path}`, {
      ...context,
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
    });
  }

  securityEvent(event: string, details: Record<string, any>, userId?: string): void {
    this.warn(`Security event: ${event}`, { ...details, userId, event });
  }

  performance(metric: string, value: number, unit: string, context?: Record<string, any>): void {
    this.info(`Performance: ${metric}`, { ...context, metric, value, unit });
  }

  // Get logs from memory transport (useful for debugging)
  getRecentLogs(level?: LogLevel): LogEntry[] {
    const memoryTransport = this.transports.find(t => t instanceof MemoryTransport) as MemoryTransport;
    return memoryTransport?.getLogs(level) || [];
  }
}

// Create and export singleton logger instance
export const logger = new Logger();

// Create specialized loggers for different parts of the app
export const createLogger = (context: Record<string, any>) => {
  return new Logger().setContext(context);
};

// Helper to log React errors
export const logReactError = (error: Error, errorInfo: React.ErrorInfo, context?: Record<string, any>) => {
  logger.error('React error boundary caught an error', error, {
    ...context,
    componentStack: errorInfo.componentStack,
  });
};

// Helper to log API errors
export const logApiError = (endpoint: string, error: any, context?: Record<string, any>) => {
  logger.error(`API error in ${endpoint}`, error, {
    ...context,
    endpoint,
  });
};

// Helper to log auth events
export const logAuthEvent = (event: string, userId?: string, context?: Record<string, any>) => {
  logger.info(`Auth event: ${event}`, { ...context, userId, event });
};
