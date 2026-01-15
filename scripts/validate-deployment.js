#!/usr/bin/env node

/**
 * Pre-Deployment Validation Script
 * Runs before Vercel deployment to ensure code quality
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}▶${colors.reset} ${msg}\n`),
};

async function runCommand(command, description) {
  log.info(`Running: ${description}`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('warning')) console.error(stderr);
    log.success(`${description} completed`);
    return true;
  } catch (error) {
    log.error(`${description} failed`);
    console.error(error.message);
    return false;
  }
}

async function validateDeployment() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════════╗
║   Pre-Deployment Validation Started       ║
╚════════════════════════════════════════════╝${colors.reset}
`);

  const checks = [
    {
      name: 'ESLint Code Quality Check',
      command: 'npm run lint',
      critical: true,
    },
    {
      name: 'Build Test',
      command: 'npm run build',
      critical: true,
    },
  ];

  let allPassed = true;

  for (const check of checks) {
    log.step(check.name);
    const passed = await runCommand(check.command, check.name);
    
    if (!passed) {
      allPassed = false;
      if (check.critical) {
        log.error(`Critical check failed: ${check.name}`);
        log.error('Deployment validation failed. Please fix the issues before deploying.');
        process.exit(1);
      }
    }
  }

  if (allPassed) {
    console.log(`
${colors.green}╔════════════════════════════════════════════╗
║   ✓ All Validation Checks Passed!         ║
║   Ready for Deployment                     ║
╚════════════════════════════════════════════╝${colors.reset}
`);
    process.exit(0);
  } else {
    log.warn('Some non-critical checks failed. Review before deploying.');
    process.exit(0);
  }
}

validateDeployment().catch((error) => {
  log.error('Validation script encountered an error');
  console.error(error);
  process.exit(1);
});
