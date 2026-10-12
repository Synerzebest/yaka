import { readFileSync } from 'node:fs';

// A publication checklist, not a certification of legal compliance.
const config = JSON.parse(readFileSync(new URL('../content/legal-config.json', import.meta.url), 'utf8'));
const missing = Object.entries(config)
  .filter(([key, value]) => key !== 'reviewedForPublication' && (typeof value !== 'string' || !value.trim()))
  .map(([key]) => key);
if (!config.reviewedForPublication) missing.push('reviewedForPublication (validation éditoriale et opérationnelle)');
if (missing.length) {
  console.error(
    'Textes juridiques encore préparatoires. À compléter dans content/legal-config.json :\n- ' + missing.join('\n- '),
  );
  process.exitCode = 1;
} else {
  console.log(
    'Coordonnées et validation renseignées. Vérifier aussi les procédures de docs/LEGAL.md ; ce contrôle ne certifie pas la conformité.',
  );
}
