const secretPatterns = [
  /(authorization\s*[:=]\s*bearer\s+)[^\s]+/gi,
  /(api[-_]?key\s*[:=]\s*)[^\s,;]+/gi,
  /(session(cookie)?\s*[:=]\s*)[^\s,;]+/gi,
  /(token\s*[:=]\s*)[^\s,;]+/gi,
  /(cookie\s*[:=]\s*)[^\s,;]+/gi
];

function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    return secretPatterns.reduce((acc, pattern) => acc.replace(pattern, '$1[REDACTED]'), value);
  }

  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return Object.fromEntries(Object.entries(object).map(([key, val]) => [key, redact(val)]));
  }

  return value;
}

function log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    context: context ? redact(context) : undefined
  };

  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.AGENT_BATTERY_DEBUG === '1') {
      log('debug', message, context);
    }
  },
  redact
};
