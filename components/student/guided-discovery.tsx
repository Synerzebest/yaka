'use client';

import Link from 'next/link';
import { DiscoveryVisual } from './discovery-visual';
import { useId, useState, type FormEvent } from 'react';
import type { Discovery } from '@/lib/discovery';
import { assessGuidedAnswer } from '@/lib/guided-answer';
import { lessonHref } from '@/lib/navigation';
import { Confetti } from '@/components/fun';
import { Mascot } from '@/components/mascot';

type AttemptProps = {
  question: string;
  answer: number;
  hints: string[];
  mistakes?: Discovery['mistakes'];
  retry: string;
  reasoning: string;
  onUnderstood?: () => void;
  visualKind?: Discovery['kind'];
};

function GuidedAttempt({
  question,
  answer,
  hints,
  mistakes,
  retry,
  reasoning,
  onUnderstood,
  visualKind,
}: AttemptProps) {
  const id = useId();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<ReturnType<typeof assessGuidedAnswer> | null>(null);
  const [hintCount, setHintCount] = useState(0);
  // Alternating two identical animations replays the shake after each new wrong try, without losing focus.
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const completed = response?.status === 'correct' || revealed;

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = assessGuidedAnswer(input, { answer, mistakes, retry });
    setAttempts(count => count + 1);
    setResponse(result);
    if (result.status === 'correct') onUnderstood?.();
  }

  return (
    <div className="guided-attempt">
      <form
        onSubmit={submit}
        noValidate
        className={response?.status === 'retry' ? (attempts % 2 ? 'shake' : 'shake-again') : undefined}
      >
        <label htmlFor={id}>{question}</label>
        <p className="answer-hint" id={`${id}-format`}>
          Un nombre ou une fraction (comme 3/4), sans unité. 2,5 ou 2.5 : les deux marchent.
        </p>
        <div className="answer-row">
          <input
            id={id}
            value={input}
            maxLength={100}
            autoComplete="off"
            disabled={completed}
            aria-describedby={`${id}-format ${id}-feedback`}
            aria-invalid={response?.status === 'invalid'}
            onChange={event => {
              setInput(event.target.value);
              setResponse(null);
            }}
          />
          <button className="primary-button" disabled={completed}>
            Je tente !
          </button>
        </div>
      </form>
      <div id={`${id}-feedback`} aria-live="polite" aria-atomic="true">
        {response && (
          <div className={`feedback ${response.status === 'correct' ? 'correct' : 'wrong'}`}>
            {response.status === 'correct' && <Confetti />}
            <Mascot
              mood={response.status === 'correct' ? 'happy' : response.status === 'invalid' ? 'thinking' : 'oops'}
              size={64}
            />
            <strong>
              {response.status === 'correct'
                ? 'Oui ! Tu l’as trouvé 🎉'
                : response.status === 'invalid'
                  ? 'Hmm, je n’ai pas compris ta réponse'
                  : 'Pas tout à fait… regardons ton idée'}
            </strong>
            <p>{response.message}</p>
            {response.status === 'retry' && (
              <small>Change ta réponse et réessaie, tu as droit à autant d’essais que tu veux.</small>
            )}
          </div>
        )}
      </div>
      {!completed && (
        <div className="discovery-support">
          {hintCount > 0 && visualKind && <DiscoveryVisual kind={visualKind} />}
          <div aria-live="polite">
            {hints.slice(0, hintCount).map((hint, index) => (
              <p className="discovery-clue" key={hint}>
                <strong>Indice {index + 1}</strong> {hint}
              </p>
            ))}
          </div>
          {hintCount < hints.length ? (
            <button className="outline-button" onClick={() => setHintCount(count => count + 1)}>
              {hintCount ? 'Encore un indice' : 'Un petit indice ?'}
            </button>
          ) : (
            <button
              className="text-button"
              onClick={() => {
                setRevealed(true);
                onUnderstood?.();
              }}
            >
              Toujours bloqué ? On le fait ensemble →
            </button>
          )}
        </div>
      )}
      {completed && (
        <div className="worked-example" role="status">
          <strong>{revealed ? 'On le fait ensemble 🤝' : 'Pourquoi ça marche'}</strong>
          <p>{reasoning}</p>
        </div>
      )}
    </div>
  );
}

function DiscoveryJourney({ lesson, slug }: { lesson: Discovery; slug: string }) {
  const [understood, setUnderstood] = useState(false);
  const [transferred, setTransferred] = useState(false);

  return (
    <section className="guided-discovery">
      <ol className="discovery-stages" aria-label="Les étapes de la découverte">
        <li aria-current={!understood ? 'step' : undefined}>1. J’explore</li>
        <li aria-current={understood && !transferred ? 'step' : undefined}>2. Je comprends</li>
        <li aria-current={transferred ? 'step' : undefined}>3. Je réessaie</li>
      </ol>
      <h2>{lesson.title}</h2>
      <p className="discovery-story">{lesson.story}</p>
      <GuidedAttempt
        question={lesson.question}
        answer={lesson.answer}
        hints={lesson.hints}
        visualKind={lesson.kind}
        mistakes={lesson.mistakes}
        retry={lesson.hints[0]}
        reasoning={lesson.reasoning}
        onUnderstood={() => setUnderstood(true)}
      />
      {understood && (
        <div className="discovery-reveal">
          <h3>La même idée, version maths</h3>
          <div className="discovery-symbols">{lesson.symbols}</div>
          <p>{lesson.rule}</p>
          <details className="discovery-hint">
            <summary>Le piège à éviter</summary>
            <p>{lesson.pitfall}</p>
          </details>
          <h3>Et maintenant, sans aide ?</h3>
          <p>Les nombres changent, mais l’idée reste la même. À toi !</p>
          <GuidedAttempt
            question={lesson.transfer.question}
            answer={lesson.transfer.answer}
            hints={[lesson.transfer.hint]}
            retry={lesson.transfer.hint}
            reasoning={lesson.transfer.reasoning}
            onUnderstood={() => setTransferred(true)}
          />
          {transferred && (
            <p className="discovery-clue">
              Bravo, tu as compris l’idée ! Passe à l’entraînement pour la garder bien en tête.
            </p>
          )}
        </div>
      )}
      <div className="discovery-links">
        <Link className="outline-button" href={lessonHref(slug, 'analogie')}>
          Le résumé
        </Link>
        <Link className="primary-button" href={lessonHref(slug, 'exercices')}>
          Je m’entraîne →
        </Link>
      </div>
      <p className="answer-hint">
        Ici, tu peux te tromper autant que tu veux : rien n’est noté. Seuls les exercices d’entraînement comptent dans
        ta progression.
      </p>
    </section>
  );
}

export function GuidedDiscovery(props: { lesson: Discovery; slug: string }) {
  const [restart, setRestart] = useState(0);
  return (
    <>
      <DiscoveryJourney {...props} key={`${props.slug}-${restart}`} />
      <button className="text-button discovery-restart" onClick={() => setRestart(value => value + 1)}>
        ↺ Recommencer la découverte
      </button>
    </>
  );
}

export function DiscoveryTakeaway({ lesson, slug }: { lesson: Discovery; slug: string }) {
  return (
    <section>
      <span className="subtle-tag">Le résumé</span>
      <h2>{lesson.title}</h2>
      <p>{lesson.rule}</p>
      <div className="worked-example">
        <strong>L’exemple pour s’en souvenir</strong>
        <p>{lesson.story}</p>
        <p>{lesson.reasoning}</p>
      </div>
      <div className="discovery-symbols">{lesson.symbols}</div>
      <div className="tip">
        <div>
          <strong>Le piège à éviter</strong>
          <p>{lesson.pitfall}</p>
        </div>
      </div>
      <h3>La question magique 🪄</h3>
      <p>{lesson.coach}</p>
      <div className="discovery-links">
        <Link className="outline-button" href={lessonHref(slug)}>
          Refaire la découverte
        </Link>
        <Link className="primary-button" href={lessonHref(slug, 'exercices')}>
          Je m’entraîne →
        </Link>
      </div>
    </section>
  );
}
