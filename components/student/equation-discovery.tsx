'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { parseAnswer } from '@/lib/learning';
import { lessonHref } from '@/lib/navigation';
import { Confetti } from '@/components/fun';
import { Mascot } from '@/components/mascot';

export function EquationDiscovery() {
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [transfer, setTransfer] = useState('');
  const [transferChecked, setTransferChecked] = useState<number | null>(null);
  const understood = checked === 5 || revealed;

  function check(event: FormEvent) {
    event.preventDefault();
    const value = parseAnswer(answer);
    if (Number.isFinite(value)) setChecked(value);
  }

  return (
    <section className="equation-discovery">
      <span className="subtle-tag">ON COMMENCE SANS FORMULE</span>
      <h2>Qu’y avait-il dans la poche ?</h2>
      <p>
        Tu as des billes dans une poche. On t’en donne <strong>7 de plus</strong>. Tu comptes maintenant{' '}
        <strong>12 billes</strong>.
      </p>
      <div
        className="pocket-story"
        aria-label="Nombre de départ inconnu, plus 7 billes reçues, égale 12 billes au total"
      >
        <div>
          <span className="pocket-number">?</span>
          <small>au départ</small>
        </div>
        <b>+</b>
        <div>
          <span className="pocket-number">7</span>
          <small>reçues ensuite</small>
        </div>
        <b>=</b>
        <div>
          <span className="pocket-number">12</span>
          <small>au total</small>
        </div>
      </div>
      <form onSubmit={check}>
        <label htmlFor="pocket-answer">Combien de billes avais-tu au départ ?</label>
        <div className="answer-row">
          <input
            id="pocket-answer"
            value={answer}
            onChange={e => {
              setAnswer(e.target.value);
              setChecked(null);
            }}
            autoComplete="off"
            maxLength={30}
          />
          <button className="primary-button" disabled={!Number.isFinite(parseAnswer(answer))}>
            Je tente !
          </button>
        </div>
      </form>
      <div aria-live="polite">
        {checked !== null && (
          <div className={`feedback ${checked === 5 ? 'correct' : 'wrong'}`}>
            {checked === 5 && <Confetti />}
            <Mascot mood={checked === 5 ? 'happy' : 'oops'} size={64} />
            {checked === 5 ? (
              <p>Oui ! Tes 5 billes de départ et les 7 reçues font bien 12.</p>
            ) : checked === 19 ? (
              <p>
                Tu as peut-être fait 12 + 7. Mais les 7 reçues sont <strong>déjà dans les 12</strong>. Avec 19 au
                départ, tu en aurais 26 après le cadeau. On cherche ce qu’il y avait <strong>avant</strong>.
              </p>
            ) : (
              <p>
                Essayons ton idée : {checked} au départ, puis 7 en plus, cela ferait {checked + 7}. On veut arriver à
                12. Quel nombre de départ conviendrait ?
              </p>
            )}
          </div>
        )}
      </div>
      {!understood && (
        <details className="discovery-hint">
          <summary>Un petit indice ?</summary>
          <p>
            Parmi les 12 billes, mets de côté les 7 qu’on vient de te donner. Ce qui reste, c’est ce que tu avais avant.
          </p>
          <div className="marble-row" aria-label="12 billes : les 7 reçues sont entourées">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className={i >= 5 ? 'received' : ''} aria-hidden="true">
                ●
              </span>
            ))}
          </div>
          <button className="text-button" onClick={() => setRevealed(true)}>
            Montre-moi le raisonnement
          </button>
        </details>
      )}
      {understood && (
        <div className="discovery-reveal">
          <h3>Tu viens de résoudre une équation.</h3>
          <p>
            Les 12 billes comprennent les 7 reçues. Pour retrouver le départ : <strong>12 − 7 = 5</strong>.
          </p>
          <p>
            En maths, on écrit simplement <strong>x</strong> à la place de « ce que j’avais au départ ».
          </p>
          <div className="exercise-equation">x + 7 = 12</div>
          <p>
            <strong>x</strong> : le nombre qu’on cherche. <strong>+ 7</strong> : ce qu’on ajoute. <strong>= 12</strong>{' '}
            : le résultat doit être 12. Le signe = dit que les deux côtés représentent la même quantité.
          </p>
          <h3>Pourquoi retirer 7 des deux côtés ?</h3>
          <p>
            À gauche, retirer les 7 ajoutées laisse seulement le départ. À droite, on retire ces mêmes 7 du total. On
            décrit toujours la même quantité.
          </p>
          <p className="exercise-equation">
            x + 7 − 7 = 12 − 7<br />x = 5
          </p>
          <h3>Et sans la poche ?</h3>
          <p>
            Voici <strong>x + 4 = 13</strong>. Quel nombre, augmenté de 4, donne 13 ?
          </p>
          <form
            onSubmit={e => {
              e.preventDefault();
              const value = parseAnswer(transfer);
              if (Number.isFinite(value)) setTransferChecked(value);
            }}
          >
            <label htmlFor="transfer-answer">La valeur de x</label>
            <div className="answer-row">
              <input
                id="transfer-answer"
                value={transfer}
                onChange={e => {
                  setTransfer(e.target.value);
                  setTransferChecked(null);
                }}
                autoComplete="off"
                maxLength={30}
              />
              <button className="primary-button" disabled={!Number.isFinite(parseAnswer(transfer))}>
                Vérifier mon idée
              </button>
            </div>
          </form>
          <div aria-live="polite">
            {transferChecked !== null && (
              <p className={`feedback ${transferChecked === 9 ? 'correct' : 'wrong'}`}>
                {transferChecked === 9
                  ? 'Oui : 9 + 4 = 13. Tu as retrouvé le nombre de départ, même sans l’histoire.'
                  : `Avec ${transferChecked}, le côté gauche vaut ${transferChecked + 4}, au lieu de 13. Les 4 sont déjà compris dans 13 : comment retrouver le départ ?`}
              </p>
            )}
          </div>
          <Link className="outline-button" href={lessonHref('equation-additive', 'analogie')}>
            Retrouver l’essentiel →
          </Link>
          <Link className="primary-button" href={lessonHref('equation-additive', 'exercices')}>
            Essayer avec d’autres nombres →
          </Link>
        </div>
      )}
      <p className="answer-hint">
        Ici, tu explores : ces essais ne comptent pas dans ta progression. Les exercices d’entraînement sont
        enregistrés.
      </p>
    </section>
  );
}

export function EquationTakeaway() {
  return (
    <section>
      <h2>Une équation, c’est une question sur un nombre.</h2>
      <p>
        <strong>x + 7 = 12</strong> demande : « Quel nombre, plus 7, donne 12 ? »
      </p>
      <p>
        Les 7 sont déjà compris dans le total. Pour retrouver le nombre de départ, on les retire :{' '}
        <strong>12 − 7 = 5</strong>.
      </p>
      <p>
        Dans l’écriture mathématique, on retire 7 des deux côtés : <strong>x + 7 − 7 = 12 − 7</strong>. Cela conserve
        l’égalité et laisse <strong>x = 5</strong>.
      </p>
      <div className="tip">
        <div>
          <strong>Ton moyen de vérifier</strong>
          <p>Remplace x par ton idée : 5 + 7 = 12. Les deux côtés donnent bien le même nombre.</p>
        </div>
      </div>
      <h3>Le piège : compter le cadeau deux fois</h3>
      <p>
        Faire 12 + 7 compterait à nouveau les billes reçues. Demande-toi : « Est-ce que je cherche le total après, ou le
        nombre avant ? »
      </p>
      <p>
        Cette histoire aide pour une addition. Avec une multiplication ou une soustraction, il faudra regarder ce qu’on
        a fait au nombre de départ.
      </p>
      <Link className="primary-button" href={lessonHref('equation-additive', 'exercices')}>
        À moi d’essayer →
      </Link>
    </section>
  );
}
