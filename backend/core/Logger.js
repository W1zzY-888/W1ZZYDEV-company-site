const LEVELS = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40, fatal: 50 });

export class Logger {
  constructor({ level = 'info', redactKeys = [], sink = console } = {}) {
    this.level = LEVELS[level] ? level : 'info';
    this.redactKeys = new Set(redactKeys.map(key => key.toLowerCase()));
    this.sink = sink;
  }

  debug(message, metadata = {}) { this.write('debug', message, metadata); }
  info(message, metadata = {}) { this.write('info', message, metadata); }
  warn(message, metadata = {}) { this.write('warn', message, metadata); }
  error(message, metadata = {}) { this.write('error', message, metadata); }
  fatal(message, metadata = {}) { this.write('fatal', message, metadata); }

  write(level, message, metadata = {}) {
    if (LEVELS[level] < LEVELS[this.level]) return;
    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: redact(metadata, this.redactKeys)
    };
    const writer = level === 'debug' ? 'debug' : level === 'info' ? 'info' : level === 'warn' ? 'warn' : 'error';
    this.sink[writer]?.(JSON.stringify(entry));
  }
}

function redact(value, redactKeys) {
  if (Array.isArray(value)) return value.map(item => redact(item, redactKeys));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => {
    if (redactKeys.has(key.toLowerCase())) return [key, '[REDACTED]'];
    return [key, redact(nested, redactKeys)];
  }));
}
