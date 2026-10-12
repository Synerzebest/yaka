'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './icons';
import { parseAnswer } from '@/lib/learning';

export function LandingDemo() {
  const [tab, setTab] = useState('Comprendre');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  return (
    <div className="landing-demo" id="un-premier-declic">
      <div className="demo-heading">
        <span className="demo-dot" /> UN PREMIER DÉCLIC <span>Sans inscription</span>
      </div>
      <div className="demo-tabs" role="tablist" aria-label="Essayer la méthode Yaka">
        {['Comprendre', 'Imaginer', 'Essayer'].map((name, index) => (
          <button
            id={`demo-tab-${index}`}
            aria-controls="demo-panel"
            role="tab"
            aria-selected={tab === name}
            key={name}
            className={tab === name ? 'selected' : ''}
            onClick={() => setTab(name)}
          >
            <span>0{index + 1}</span>
            {name}
          </button>
        ))}
      </div>
      <div
        className="demo-panel"
        id="demo-panel"
        role="tabpanel"
        aria-labelledby={`demo-tab-${['Comprendre', 'Imaginer', 'Essayer'].indexOf(tab)}`}
      >
        <span className="demo-subject">LES ÉQUATIONS, TOUT SIMPLEMENT</span>
        <h3>
          {tab === 'Comprendre'
            ? 'Et si x n’était plus un mystère ?'
            : tab === 'Imaginer'
              ? 'Pense à une balance.'
              : 'À ton tour de trouver x.'}
        </h3>
        <div className="demo-equation">
          <span className="demo-x">x</span>
          <span>+</span>
          <span>3</span>
          <span>=</span>
          <span>8</span>
        </div>
        {tab === 'Comprendre' && (
          <>
            <p>
              On cherche le nombre qui, ajouté à 3, donne 8. Pour trouver <strong>x</strong>, on retire 3 des deux
              côtés.
            </p>
            <div className="demo-insight">
              <Icon name="bolt" size={18} />
              <span>La même opération des deux côtés : l’égalité reste vraie.</span>
            </div>
            <button className="text-button" onClick={() => setTab('Imaginer')}>
              Voir avec une image <Icon name="arrow" size={16} />
            </button>
          </>
        )}
        {tab === 'Imaginer' && (
          <>
            <div className="demo-balance" aria-hidden="true">
              ⚖️
            </div>
            <p>
              Les deux plateaux sont en équilibre. Retire trois poids de chaque côté : il reste{' '}
              <strong>x d’un côté, et 5 de l’autre</strong>.
            </p>
            <button className="text-button" onClick={() => setTab('Essayer')}>
              J’essaie par moi-même <Icon name="arrow" size={16} />
            </button>
          </>
        )}
        {tab === 'Essayer' && (
          <>
            <form
              onSubmit={event => {
                event.preventDefault();
                setResult(parseAnswer(answer) === 5);
              }}
            >
              <label htmlFor="demo-answer">Quelle est la valeur de x ?</label>
              <div className="answer-row">
                <input
                  id="demo-answer"
                  value={answer}
                  onChange={event => {
                    setAnswer(event.target.value);
                    setResult(null);
                  }}
                  maxLength={30}
                  placeholder="Ta réponse…"
                  autoComplete="off"
                />
                <button className="primary-button" disabled={!Number.isFinite(parseAnswer(answer))}>
                  Vérifier <Icon name="check" size={16} />
                </button>
              </div>
            </form>
            <div aria-live="polite">
              {result !== null && (
                <p className={`demo-result ${result ? 'success' : 'retry'}`}>
                  {result
                    ? 'Exactement ! 5 + 3 = 8. Tu viens de résoudre une équation.'
                    : 'Reprenons : retire 3 des deux côtés. x = 8 − 3 = 5. Essaie avec cette valeur.'}
                </p>
              )}
            </div>
            {result === true && (
              <Link className="text-button" href="/connexion?mode=inscription">
                Continuer avec mon compte <Icon name="arrow" size={16} />
              </Link>
            )}
          </>
        )}
      </div>
      <div className="demo-caption">
        <Icon name="leaf" size={15} /> Ici, une erreur est un point de départ.
      </div>
    </div>
  );
}
