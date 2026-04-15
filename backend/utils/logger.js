const LEVEL = (process.env.LOG_LEVEL || 'debug').toLowerCase();

function shouldLog(level) {
  const order = { error: 0, warn: 1, info: 2, debug: 3 };
  return order[level] <= (order[LEVEL] ?? 3);
}

module.exports = {
  info: (...args) => { if (shouldLog('info')) console.log('[info]', ...args); },
  warn: (...args) => { if (shouldLog('warn')) console.warn('[warn]', ...args); },
  error: (...args) => { if (shouldLog('error')) console.error('[error]', ...args); },
  debug: (...args) => { if (shouldLog('debug')) console.debug('[debug]', ...args); }
};
