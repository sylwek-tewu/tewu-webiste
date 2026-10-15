#!/usr/bin/env node
// Checks a running build against the SEO fixes: pnpm seo:check [baseUrl]
// Exit code 1 when any check reports an error; warnings do not fail the run.
import { runSeoCheck } from './seo-check-run.mjs';

const baseUrl = (process.argv[2] ?? 'http://127.0.0.1:3000').replace(/\/+$/, '');

function report({ label, findings }) {
  const icon = findings.some((f) => f.level === 'error') ? 'FAIL' : findings.length ? 'WARN' : 'OK  ';
  console.info(`${icon} ${label}`);
  for (const f of findings) console.info(`       ${f.level === 'error' ? 'error  ' : 'warning'} [${f.check}] ${f.message}`);
}

async function main() {
  console.info(`seo:check against ${baseUrl} (Host: tewu.szczecin.pl)\n`);
  const { urlCount, results } = await runSeoCheck(baseUrl);
  console.info(`sitemap.xml lists ${urlCount} URLs\n`);
  results.forEach(report);

  const findings = results.flatMap((r) => r.findings);
  const errorCount = findings.filter((f) => f.level === 'error').length;
  const warningCount = findings.length - errorCount;
  console.info(`\n${urlCount} pages, ${errorCount} errors, ${warningCount} warnings`);
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
