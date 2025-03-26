import chalk from 'chalk';

export const formatMessage = (
  message: string,
  type: 'info' | 'warn' | 'error' | 'success' = 'info'
) => {
  switch (type) {
    case 'warn':
      return chalk.yellow(`⚠️  ${message}`);
    case 'error':
      return chalk.red(`❌ ${message}`);
    case 'success':
      return chalk.green(`✓ ${message}`);
    default:
      return chalk.gray(message);
  }
};

export const logInfo = (message: string) => {
  console.log(formatMessage(message));
};

export const logWarn = (message: string) => {
  console.log(formatMessage(message, 'warn'));
};

export const logError = (message: string) => {
  console.log(formatMessage(message, 'error'));
};

export const logSuccess = (message: string) => {
  console.log(formatMessage(message, 'success'));
};

export const logWatcherName = (name: string) => chalk.cyan(name);
export const logCount = (count: number) => chalk.yellow(count.toString());

export const logHeader = (message: string) => {
  console.log(chalk.cyan(`\n${message}\n`));
};

export const logSection = (message: string) => {
  console.log(chalk.gray(`\n${message}`));
};
