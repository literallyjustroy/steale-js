import log4js from 'log4js';

log4js.configure({
    appenders: {
        console: { type: 'stdout', layout: { type: 'colored' } },
        logFile: { type: 'file', filename: 'logs/log.log' },
        transactions: { type: 'file', filename: 'logs/transactions.log' }
    },
    categories: {
        logOnly: { appenders: ['logFile'], level: 'info' },
        default: { appenders: ['logFile', 'console'], level: 'debug' },
        transactions: { appenders: ['logFile', 'console', 'transactions'], level: 'debug' }
    }
});

export const log = log4js.getLogger('default');
export const logOnly = log4js.getLogger('logOnly');
export const transactions = log4js.getLogger('transactions');
