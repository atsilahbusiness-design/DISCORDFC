type LogLevel = 'info' | 'warn' | 'error';

function safeValue(value: unknown): unknown {
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack };
  return value;
}

export function log(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  const payload = { timestamp: new Date().toISOString(), level, event, ...fields };
  const output = JSON.stringify(Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, safeValue(value)])));
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
}
