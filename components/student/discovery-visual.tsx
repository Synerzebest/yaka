'use client';

import { useState } from 'react';
import type { ExerciseKind } from '@/lib/learning';

// Small manipulable illustrations for the concrete examples, revealed with the first hint.
export function DiscoveryVisual({ kind }: { kind: ExerciseKind }) {
  const [step, setStep] = useState(0);
  if (kind === 'equivalent_fractions' || kind === 'fractions') {
    const recut = kind === 'equivalent_fractions';
    const total = recut ? (step ? 6 : 3) : 8;
    const first = recut ? (step ? 4 : 2) : 2;
    return (
      <figure className="discovery-visual">
        <div
          className="fraction-strip"
          role="img"
          aria-label={
            recut
              ? `${first} morceaux sur ${total}, même quantité de gâteau`
              : 'Huit parts : deux prises au début, puis trois de plus'
          }
        >
          {Array.from({ length: total }, (_, index) => (
            <span
              aria-hidden="true"
              key={index}
              className={index < first ? 'part-first' : !recut && index < 5 ? 'part-next' : ''}
            />
          ))}
        </div>
        <figcaption>
          {recut
            ? 'La portion verte garde la même taille. Seul le découpage change.'
            : 'Vert : les deux premières parts. Orange : les trois parts prises ensuite. Les parts gardent la même taille.'}
        </figcaption>
        {recut && (
          <button className="outline-button" onClick={() => setStep(step ? 0 : 1)}>
            {step ? 'Revenir aux tiers' : 'Recouper chaque part en deux'}
          </button>
        )}
      </figure>
    );
  }
  if (kind === 'integers') {
    const position = -4 + step;
    return (
      <figure className="discovery-visual">
        <svg
          viewBox="0 0 340 85"
          role="img"
          aria-label={`Départ −4. Après ${step} niveaux de montée, position ${position}.`}
        >
          <path d="M20 35H320" stroke="#71826b" strokeWidth="2" />
          {Array.from({ length: 10 }, (_, index) => {
            const n = index - 5;
            const x = 20 + index * 33;
            return (
              <g key={n}>
                <path d={`M${x} 30v10`} stroke="#71826b" />
                <text x={x} y="63" textAnchor="middle" fontSize="13" fill="#33452d">
                  {n}
                </text>
                {n === position && <circle cx={x} cy="35" r="8" fill="#456744" />}
              </g>
            );
          })}
        </svg>
        <figcaption aria-live="polite">
          {step} déplacement{step > 1 ? 's' : ''} sur 7 · niveau actuel : {position}
        </figcaption>
        <button className="outline-button" onClick={() => setStep(step === 7 ? 0 : step + 1)}>
          {step === 7 ? 'Repartir du sous-sol' : 'Monter d’un niveau'}
        </button>
      </figure>
    );
  }
  if (kind === 'geometry') {
    return (
      <figure className="discovery-visual">
        <div
          className="discovery-tiles"
          role="img"
          aria-label="Trois rangées de quatre carrés, chacun de un mètre carré"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} aria-hidden="true" />
          ))}
        </div>
        <figcaption>Chaque carré couvre 1 m². Compte une rangée, puis le nombre de rangées.</figcaption>
      </figure>
    );
  }
  if (kind === 'perimeter') {
    const sides = ['M50 20H250', 'M250 20V140', 'M250 140H50', 'M50 140V20'];
    return (
      <figure className="discovery-visual">
        <svg viewBox="0 0 300 170" role="img" aria-label={`Cadre de 5 cm sur 3 cm. ${step} côtés du contour suivis.`}>
          {sides.map((d, i) => (
            <path key={d} d={d} stroke={i < step ? '#456744' : '#d9dfd0'} strokeWidth="6" fill="none" />
          ))}
          <text x="150" y="12" textAnchor="middle" fontSize="13">
            5 cm
          </text>
          <text x="260" y="85" fontSize="13">
            3 cm
          </text>
        </svg>
        <figcaption aria-live="polite">
          {step === 0
            ? 'Suis le bord pour revenir au départ.'
            : `${[5, 3, 5, 3].slice(0, step).join(' + ')} cm parcourus${step === 4 ? ' : le tour est complet.' : '.'}`}
        </figcaption>
        <button className="outline-button" onClick={() => setStep(step === 4 ? 0 : step + 1)}>
          {step === 4 ? 'Refaire le tour' : 'Suivre le côté suivant'}
        </button>
      </figure>
    );
  }
  if (kind === 'arithmetic_sequence' || kind === 'geometric_sequence') {
    const arithmetic = kind === 'arithmetic_sequence';
    const values = arithmetic ? [10, 13, 16, 19, 22] : [3, 6, 12, 24];
    return (
      <figure className="discovery-visual">
        <div className="sequence-stops" aria-live="polite">
          {values.slice(0, step + 1).map((value, index) => (
            <span key={index}>
              <small>Étape {index}</small>
              <strong>{value}</strong>
            </span>
          ))}
        </div>
        <figcaption>
          {arithmetic ? 'À chaque passage, ajoute 3.' : 'À chaque passage, double le groupe déjà obtenu.'} Le départ est
          l’étape 0.
        </figcaption>
        <button className="outline-button" onClick={() => setStep(step === values.length - 1 ? 0 : step + 1)}>
          {step === values.length - 1 ? 'Revenir au départ' : 'Voir le passage suivant'}
        </button>
      </figure>
    );
  }
  return null;
}
