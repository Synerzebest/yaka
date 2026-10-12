'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { startExercise, submitExercise } from '@/app/exercices/actions';
import type { ExerciseSession, PublicExercise } from '@/lib/connected-learning';
import { formatPolynomial, parseAnswer, parsePolynomial } from '@/lib/learning';
import { lessonHref } from '@/lib/navigation';
import { useStudent } from './provider';

type Result = {
  correct: boolean;
  feedback: string;
  answer: string;
  guidance?: { observation: string | null; question: string } | null;
};

/** Client-side check only, to enable the button. The server grades and validates again. */
function readyToSubmit(exercise: PublicExercise, answer: string) {
  if (!answer.trim()) return false;
  if (exercise.format === 'choice') return true;
  if (exercise.format === 'polynomial') return parsePolynomial(answer) !== null;
  return Number.isFinite(parseAnswer(answer));
}

export function ExerciseRunner({ slug, coach }: { slug: string; coach?: string }) {
  const { acceptProgress } = useStudent();
  const [session, setSession] = useState<ExerciseSession | null>(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [explanation, setExplanation] = useState(false);
  const [request, setRequest] = useState<{ count: number; previousVariant?: string }>({ count: 0 });
  const submitting = useRef(false);

  useEffect(() => {
    let active = true;
    startExercise(slug, request.previousVariant)
      .then(response => {
        if (!active) return;
        if ('error' in response) setError(response.error);
        else setSession(response.session);
      })
      .catch(() => {
        if (active) setError('Impossible de charger l’exercice. Réessaie.');
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [slug, request]);

  function next() {
    setRequest(current => ({
      count: current.count + 1,
      previousVariant: session?.exercise.variant ?? current.previousVariant,
    }));
    setSession(null);
    setAnswer('');
    setResult(null);
    setExplanation(false);
    setError('');
    setBusy(true);
  }

  async function check() {
    if (!session || result || busy || submitting.current || !readyToSubmit(session.exercise, answer)) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await submitExercise(session.id, answer);
      if ('error' in response) setError(response.error);
      else {
        setResult(response.result);
        acceptProgress(response.progress);
      }
    } catch {
      setError('Réponse non confirmée. Réessaie : elle ne sera comptée qu’une fois.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <div className="exercise-header">
        <span className="subtle-tag">À TOI DE JOUER</span>
        <span>Autant d’essais que tu veux</span>
      </div>
      {error && (
        <p className="auth-message error" role="alert">
          {error}
        </p>
      )}
      {!session ? (
        <>
          <p role="status">{busy ? 'Préparation de ton exercice…' : 'L’exercice n’a pas pu être chargé.'}</p>
          {!busy && (
            <button className="outline-button" onClick={next}>
              Réessayer
            </button>
          )}
        </>
      ) : (
        <>
          <h3>{session.exercise.prompt}</h3>
          <div className="exercise-equation">{session.exercise.expression}</div>
          <details className="discovery-hint">
            <summary>Retrouver une piste avant de répondre</summary>
            <p>{coach || 'Que faut-il retirer du total pour retrouver le nombre de départ ?'}</p>
            <Link className="text-button" href={lessonHref(slug)}>
              Revoir le déclic →
            </Link>
          </details>
          <form
            onSubmit={event => {
              event.preventDefault();
              void check();
            }}
          >
            <AnswerField
              exercise={session.exercise}
              answer={answer}
              onChange={setAnswer}
              disabled={!!result || busy}
              busy={busy}
            />
            {session.exercise.format === 'choice' && (
              <button className="primary-button choice-submit" disabled={!!result || busy || !answer}>
                {busy ? 'Vérification…' : 'Vérifier'}
              </button>
            )}
          </form>
          <div aria-live="polite">
            {result && (
              <Feedback
                slug={slug}
                exercise={session.exercise}
                result={result}
                explanation={explanation}
                onExplain={() => setExplanation(true)}
              />
            )}
          </div>
          {(result || error) && (
            <button className="outline-button next-exercise" disabled={busy} onClick={next}>
              Un nouvel exercice →
            </button>
          )}
        </>
      )}
    </>
  );
}

function AnswerField({
  exercise,
  answer,
  onChange,
  disabled,
  busy,
}: {
  exercise: PublicExercise;
  answer: string;
  onChange: (value: string) => void;
  disabled: boolean;
  busy: boolean;
}) {
  if (exercise.format === 'choice') {
    return (
      <fieldset className="choice-list" disabled={disabled}>
        <legend>Ta réponse</legend>
        <p className="answer-hint">{exercise.hint}</p>
        {exercise.choices?.map((label, index) => (
          <label key={label} className={answer === String(index) ? 'choice-option selected' : 'choice-option'}>
            <input
              type="radio"
              name="choice"
              value={index}
              checked={answer === String(index)}
              onChange={() => onChange(String(index))}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    );
  }
  const ready = readyToSubmit(exercise, answer);
  const parsed = exercise.format === 'polynomial' && answer.trim() ? parsePolynomial(answer) : null;
  return (
    <>
      <label htmlFor="answer">Ta réponse {exercise.unit && `(en ${exercise.unit})`}</label>
      <p className="answer-hint" id="answer-hint">
        {exercise.hint}
      </p>
      <div className="answer-row">
        <input
          id="answer"
          aria-describedby="answer-hint answer-preview"
          placeholder={exercise.format === 'polynomial' ? 'Ton expression…' : 'Ton résultat…'}
          value={answer}
          onChange={event => onChange(event.target.value)}
          disabled={disabled}
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
        />
        <button className="primary-button" disabled={disabled || !ready}>
          {busy ? 'Vérification…' : 'Vérifier'}
        </button>
      </div>
      {exercise.format === 'polynomial' && answer.trim() && (
        <p className="answer-preview" id="answer-preview">
          {parsed ? (
            <>
              Lu comme : <strong>{formatPolynomial(parsed.coefficients)}</strong>
            </>
          ) : (
            'Expression non reconnue : écris-la sous forme développée, par exemple 3x² − 2x + 1.'
          )}
        </p>
      )}
    </>
  );
}

function Feedback({
  slug,
  exercise,
  result,
  explanation,
  onExplain,
}: {
  slug: string;
  exercise: PublicExercise;
  result: Result;
  explanation: boolean;
  onExplain: () => void;
}) {
  // The pilot lesson substitutes the student's value into "x + a = b".
  const equation = slug === 'equation-additive' ? exercise.expression.match(/^x \+ (\d+) = (\d+)$/) : null;
  const tried = parseAnswer(result.answer);
  return (
    <div className={`feedback ${result.correct ? 'correct' : 'wrong'}`}>
      <strong>{result.correct ? 'Bien joué, tu as trouvé ! 🎉' : 'Pas encore… mais tu es là pour apprendre.'}</strong>
      {!result.correct && equation && Number.isFinite(tried) && (
        <p>
          Testons ton idée : avec {tried} à la place de x, le côté gauche donne {tried + Number(equation[1])}. On
          cherche {equation[2]}. Les {equation[1]} ajoutés sont déjà compris dans ce total : comment retrouver le nombre
          de départ ?
        </p>
      )}
      {!result.correct && result.guidance && (
        <div className="exercise-guidance">
          {result.guidance.observation && <p>{result.guidance.observation}</p>}
          <p>
            <strong>Pour reprendre le fil</strong>
            <br />
            {result.guidance.question}
          </p>
          <Link className="text-button" href={lessonHref(slug)}>
            Revenir à la découverte →
          </Link>
        </div>
      )}
      <button className="text-button" onClick={onExplain}>
        {result.correct ? 'Comprendre pourquoi ça marche' : 'Voir le raisonnement complet'}
      </button>
      {explanation && <p className="explanation-steps">{result.feedback}</p>}
    </div>
  );
}
