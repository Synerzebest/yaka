import test from 'node:test';
import assert from 'node:assert/strict';
import {
  exerciseKinds,
  exerciseVariants,
  generateExercise,
  isCorrect,
  inspectAnswer,
  expectedInput,
  explain,
  findMistake,
  parsePolynomial,
  formatPolynomial,
  answerLabel,
  normalizeStoredExercise,
} from '../lib/learning.ts';
import { publicExercise } from '../lib/connected-learning.ts';

// Answers computed by hand for each template with the smallest draws (rng = () => 0).
// Numbers for numeric answers, the expected label for choices, coefficients by increasing degree for expressions.
// The first template of each lesson is checked in curriculum.test.mjs.
const fixtures = {
  'integers/soustraction': -1,
  'integers/comparaison': '-5',
  'order_operations/parentheses': 8,
  'order_operations/division': 1,
  'equivalent_fractions/denominateur': 4,
  'equivalent_fractions/simplifier': '1/2',
  'percentage/prix-final': 36,
  'percentage/quel-pourcentage': 10,
  'perimeter/largeur': 1,
  'perimeter/carre': 2,
  'triangle_angles/isocele': 80,
  'triangle_angles/rectangle': 75,
  'fractions/soustraction': 1,
  'fractions/denominateurs-differents': 3 / 4,
  'equations/soustraction': 4,
  'equations/multiplication': 2,
  'geometry/triangle': 2,
  'geometry/cote-manquant': 2,
  'powers/quotient': 2,
  'powers/puissance-de-puissance': 4,
  'proportion/recette': 150,
  'proportion/echelle': 0.5,
  'mean/valeur-manquante': 5,
  'mean/mediane': 4,
  'linear_equation/deux-membres': -6,
  'linear_equation/parentheses': -5,
  'distributivity/developper': [-27, 2],
  'distributivity/double-distributivite': [36, -12, 1],
  'pythagoras/cote-angle-droit': 4,
  'pythagoras/reciproque': 'Non, il n’est pas rectangle',
  'affine/antecedent': -5,
  'affine/sens-de-variation': 'Décroissante',
  'slope/equation-a-isoler': -5,
  'slope/equation-de-droite': [-6, -4],
  'frequency/effectif': 1,
  'frequency/tableau': 5,
  'quadratic_roots/forme-developpee': -6,
  'quadratic_roots/nombre-de-solutions': 'Deux solutions',
  'system/substitution': -4,
  'system/probleme': 4,
  'sine_ratio/cosinus': 4 / 5,
  'sine_ratio/cote-oppose': 3,
  'similarity/rapport-reduction': 1 / 2,
  'similarity/aire': 12,
  'vertex/forme-canonique': -5,
  'vertex/maximum-ou-minimum': 'Un maximum',
  'probability/de': 5 / 6,
  'probability/contraire': 2 / 3,
  'arithmetic_sequence/raison': -5,
  'arithmetic_sequence/somme': 15,
  'geometric_sequence/raison': 2,
  'geometric_sequence/somme': 7,
  'radians/vers-degres': 30,
  'radians/longueur-arc': 1 / 3,
  'unit_circle/cosinus': 1,
  'unit_circle/signes': 'sin > 0 et cos > 0',
  'dot_product/normes-et-angle': 4,
  'dot_product/orthogonalite': -3,
  'removable_limit/trinome': 2,
  'removable_limit/cube': 3,
  'rational_limit/comparer-les-degres': '0',
  'rational_limit/degre-trois': -4.5,
  'derivative/fonction-derivee': [-9, -12, -15],
  'derivative/polynome-en-un-point': -12,
  'tangent/equation': [27, 13],
  'tangent/pente': 48,
  'exponential/interets-composes': 102.01,
  'exponential/demi-vie': 3,
  'logarithm/equation': Math.log2(3),
  'logarithm/puissance-negative': -1,
  'integral/polynome': 2,
  'integral/primitive': [0, -9, -5, -3],
  'conditional_probability/tableau': 1 / 2,
  'conditional_probability/formule': 0.25,
  'combinations/ordre': 12,
  'combinations/menu': 8,
  'binomial/k-succes': 1 / 8,
  'binomial/esperance': 1,
  'standardization/valeur': 14,
  'standardization/comparaison': 'L’élève A',
  'optimization/valeur-maximale': 8,
  'optimization/enclos': 4,
  'area_between/droite-et-parabole': 1 / 6,
  'area_between/sous-l-axe': 4 / 3,
};

const zero = () => 0;
function seeded(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test('every lesson offers at least three templates, and every new template has a reference answer', () => {
  for (const kind of exerciseKinds) {
    const variants = exerciseVariants(kind);
    assert.ok(variants.length >= 3, `${kind}: ${variants.length} templates`);
    assert.equal(new Set(variants).size, variants.length, `${kind}: duplicated template id`);
    for (const variant of variants.slice(1))
      assert.ok(`${kind}/${variant}` in fixtures, `${kind}/${variant}: missing fixture`);
  }
  for (const key of Object.keys(fixtures)) {
    const [kind, variant] = key.split('/');
    assert.ok(exerciseVariants(kind).includes(variant), `${key}: unknown template`);
  }
});

for (const [key, expected] of Object.entries(fixtures)) {
  test(`${key}: known answer`, () => {
    const [kind, variant] = key.split('/');
    const exercise = generateExercise(kind, zero, { variant });
    assert.equal(exercise.variant, variant);
    if (typeof expected === 'string') {
      assert.equal(exercise.format, 'choice');
      assert.equal(exercise.choices[exercise.answer], expected);
      assert.ok(isCorrect(exercise, String(exercise.answer)));
    } else if (Array.isArray(expected)) {
      assert.equal(exercise.format, 'polynomial');
      assert.deepEqual(exercise.answer, expected);
      assert.ok(isCorrect(exercise, formatPolynomial(expected)));
    } else {
      assert.equal(exercise.format, 'number');
      assert.ok(Math.abs(exercise.answer - expected) < 1e-9, `${exercise.answer} ≠ ${expected}`);
      const typed = exercise.precision === undefined ? String(expected) : expected.toFixed(exercise.precision);
      assert.ok(isCorrect(exercise, typed.replace('.', ',')));
    }
  });
}

test('thousands of random exercises are coherent in every template', () => {
  const random = seeded(2026);
  for (const kind of exerciseKinds) {
    for (const variant of exerciseVariants(kind)) {
      for (let index = 0; index < 60; index++) {
        const exercise = generateExercise(kind, random, { variant });
        const label = `${kind}/${variant}`;
        assert.ok(exercise.prompt.trim() && exercise.expression.trim() && exercise.hint.trim(), label);
        assert.ok(exercise.steps.length >= 2, label);
        assert.ok(
          !/NaN|undefined|Infinity|\[object/.test([exercise.prompt, exercise.expression, ...exercise.steps].join(' ')),
          `${label}: ${exercise.expression}`,
        );
        assert.ok(isCorrect(exercise, expectedInput(exercise)), `${label}: expected input refused`);
        assert.ok(!isCorrect(exercise, ''), label);
        assert.ok(explain(exercise, expectedInput(exercise)).length > 20, label);
        if (exercise.format === 'number') {
          assert.ok(Number.isFinite(exercise.answer), label);
          if (exercise.precision !== undefined)
            assert.ok(isCorrect(exercise, exercise.answer.toFixed(exercise.precision)), label);
        }
        if (exercise.format === 'choice') {
          assert.ok(exercise.choices.length >= 2, label);
          assert.equal(
            new Set(exercise.choices).size,
            exercise.choices.length,
            `${label}: duplicated choices ${exercise.choices}`,
          );
          assert.ok(
            Number.isInteger(exercise.answer) && exercise.answer >= 0 && exercise.answer < exercise.choices.length,
            label,
          );
          assert.ok(
            exercise.choices.every(choice => choice.length <= 100),
            label,
          );
        }
        if (exercise.format === 'polynomial') assert.ok(parsePolynomial(formatPolynomial(exercise.answer)), label);
        // A recognised mistake must never be a correct answer, and must be recognised.
        for (const mistake of exercise.mistakes) {
          const input = exercise.format === 'polynomial' ? formatPolynomial(mistake.value) : String(mistake.value);
          assert.ok(!isCorrect(exercise, input), `${label}: mistake ${input} is correct`);
          assert.equal(findMistake(exercise, input), mistake.message, `${label}: mistake ${input} not recognised`);
        }
      }
    }
  }
});

test('lesson-specific ranges stay realistic in every template', () => {
  const random = seeded(7);
  for (let index = 0; index < 300; index++) {
    for (const kind of ['probability', 'conditional_probability', 'binomial', 'sine_ratio']) {
      const exercise = generateExercise(kind, random);
      if (exercise.format === 'number' && !['cote-oppose', 'esperance'].includes(exercise.variant))
        assert.ok(exercise.answer >= 0 && exercise.answer <= 1, `${kind}/${exercise.variant}`);
    }
    const angle = generateExercise('triangle_angles', random);
    assert.ok(angle.answer > 0 && angle.answer < 180);
    for (const kind of ['integral', 'area_between', 'pythagoras', 'geometry', 'perimeter', 'combinations']) {
      const exercise = generateExercise(kind, random);
      if (exercise.format === 'number' && kind !== 'integral')
        assert.ok(exercise.answer > 0, `${kind}/${exercise.variant}`);
    }
  }
});

test('the next exercise avoids the previous template', () => {
  const random = seeded(11);
  for (const kind of exerciseKinds) {
    for (const previous of exerciseVariants(kind)) {
      for (let index = 0; index < 10; index++)
        assert.notEqual(generateExercise(kind, random, { avoid: previous }).variant, previous);
    }
  }
  assert.throws(() => generateExercise('integers', zero, { variant: 'inconnue' }));
});

test('the public payload of every format hides answers and mistakes', () => {
  for (const kind of exerciseKinds) {
    for (const variant of exerciseVariants(kind)) {
      const exercise = { ...generateExercise(kind, seeded(3), { variant }), futureSecret: 'DO_NOT_LEAK' };
      const payload = JSON.parse(JSON.stringify(publicExercise(exercise)));
      for (const forbidden of ['answer', 'steps', 'mistakes', 'futureSecret'])
        assert.ok(!(forbidden in payload), `${kind}/${variant}: ${forbidden}`);
      assert.equal(payload.format, exercise.format);
      if (exercise.format === 'choice') assert.deepEqual(payload.choices, exercise.choices);
      else assert.ok(!('choices' in payload));
    }
  }
});

test('polynomial answers accept usual notations and refuse unreduced or factored forms', () => {
  for (const input of ['6x+15', '6x + 15', '15 + 6x', 'y = 6x + 15', '6*x+15', ' 6X + 15 ']) {
    assert.deepEqual(parsePolynomial(input)?.coefficients, [15, 6], input);
  }
  assert.deepEqual(parsePolynomial('3x² − 2x + 1').coefficients, [1, -2, 3]);
  assert.deepEqual(parsePolynomial('3x^2-2x+1').coefficients, [1, -2, 3]);
  assert.deepEqual(parsePolynomial("f'(x) = -x^3 + 1/2x").coefficients, [0, 0.5, 0, -1]);
  assert.deepEqual(parsePolynomial('f′(x)=2,5x').coefficients, [0, 2.5]);
  assert.deepEqual(parsePolynomial('x - x').coefficients, []);
  assert.equal(parsePolynomial('6x + 10 + 5').reduced, false);
  for (const invalid of ['', '3(2x+5)', '2x3', 'x^', '6x++1', 'x/2', 'abc', '2^x', 'x^9', '1/0x', 'x'.repeat(101)]) {
    assert.equal(parsePolynomial(invalid), null, invalid);
  }
  const exercise = generateExercise('distributivity', zero, { variant: 'developper' });
  assert.ok(isCorrect(exercise, '2x - 27'));
  assert.ok(isCorrect(exercise, '-27 + 2x'));
  assert.ok(!isCorrect(exercise, '2x + 27'));
  assert.equal(inspectAnswer(exercise, '2x - 20 - 7').valid, false);
  assert.equal(inspectAnswer(exercise, '2(x - 13,5)').valid, false);
  assert.equal(formatPolynomial([-27, 2]), '2x − 27');
  assert.equal(formatPolynomial([0, -1, 1]), 'x² − x');
  assert.equal(formatPolynomial([]), '0');
});

test('multiple-choice answers are indexes, stored with their readable label', () => {
  const exercise = generateExercise('pythagoras', zero, { variant: 'reciproque' });
  for (const invalid of ['', '-1', '1.0', String(exercise.choices.length), 'Oui'])
    assert.equal(inspectAnswer(exercise, invalid).valid, false, invalid);
  const wrong = exercise.choices.findIndex((_, index) => index !== exercise.answer);
  assert.ok(findMistake(exercise, String(wrong)));
  assert.equal(answerLabel(exercise, String(exercise.answer)), 'Non, il n’est pas rectangle');
});

test('instances stored before the formats existed are graded as numbers', () => {
  const legacy = {
    kind: 'equations',
    prompt: 'Trouve x.',
    expression: 'x + 2 = 7',
    answer: 5,
    steps: ['a', 'b'],
    mistakes: [],
    hint: '',
  };
  const exercise = normalizeStoredExercise(legacy);
  assert.equal(exercise.format, 'number');
  assert.ok(isCorrect(exercise, '5'));
  assert.ok(!isCorrect(exercise, '4'));
});
