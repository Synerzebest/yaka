'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './icons';
import { parseAnswer } from '@/lib/learning';
import { Confetti } from './fun';

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
              <strong>x</strong>, c’est juste un nombre caché. On cherche quel nombre, avec 3 en plus, fait 8. Pour le
              démasquer, on enlève 3 des deux côtés.
            </p>
            <div className="demo-insight">
              <Icon name="bolt" size={18} />
              <span>Ce que tu fais d’un côté du =, tu le fais de l’autre. Et tout reste juste.</span>
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
              Imagine une balance bien droite. Enlève 3 poids de chaque côté : elle reste droite, et il reste{' '}
              <strong>x d’un côté, 5 de l’autre</strong>. Donc x = 5 !
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
                  {result && <Confetti />}
                  {result
                    ? 'Exactement ! 5 + 3 = 8. Bravo, tu viens de résoudre une équation 🎉'
                    : 'Pas tout à fait. Quel nombre, avec 3 en plus, donne 8 ? Enlève les 3 du 8 pour le trouver.'}
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
        <Icon name="leaf" size={15} /> Ici, se tromper fait partie du jeu.
      </div>
    </div>
  );
}
