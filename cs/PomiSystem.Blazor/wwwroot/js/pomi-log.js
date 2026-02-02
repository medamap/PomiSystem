window.pomiLog = {
    _entries: [],
    _max: 200,
    _orig: {},
    _push: (level, message, detail) => {
        const time = new Date().toISOString();
        const entry = `[${time}] [${level}] ${message}${detail ? ' | ' + detail : ''}`;
        window.pomiLog._entries.push(entry);
        if (window.pomiLog._entries.length > window.pomiLog._max) {
            window.pomiLog._entries.shift();
        }
    },
    log: (message, detail) => window.pomiLog._push('LOG', message, detail),
    warn: (message, detail) => window.pomiLog._push('WARN', message, detail),
    error: (message, detail) => window.pomiLog._push('ERROR', message, detail),
    clear: () => {
        window.pomiLog._entries = [];
    },
    getText: () => window.pomiLog._entries.join('\n'),
    isAvailable: () => true,
    hookErrors: () => {
        if (window.pomiLog._hooked) {
            return;
        }
        window.pomiLog._orig.log = console.log;
        window.pomiLog._orig.warn = console.warn;
        window.pomiLog._orig.error = console.error;
        console.log = (...args) => {
            window.pomiLog._push('LOG', args.map(String).join(' '), '');
            window.pomiLog._orig.log.apply(console, args);
        };
        console.warn = (...args) => {
            window.pomiLog._push('WARN', args.map(String).join(' '), '');
            window.pomiLog._orig.warn.apply(console, args);
        };
        console.error = (...args) => {
            window.pomiLog._push('ERROR', args.map(String).join(' '), '');
            window.pomiLog._orig.error.apply(console, args);
        };
        window.addEventListener('error', (event) => {
            const detail = event?.error ? (event.error.stack || String(event.error)) : '';
            window.pomiLog.error(event.message || 'Unknown error', detail);
        });
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event?.reason ? (event.reason.stack || String(event.reason)) : '';
            window.pomiLog.error('Unhandled rejection', reason);
        });
        window.pomiLog._hooked = true;
    }
};
