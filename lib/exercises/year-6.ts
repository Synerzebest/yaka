import { choice, numeric, polynomial, ratio, type VariantMap } from './build.ts';
import { formatPolynomial, number, power } from './format.ts';

const binomialCoefficient = (n: number, k: number) => {
  let result = 1;
  for (let index = 1; index <= k; index++) result = (result * (n - k + index)) / index;
  return result;
};

// 6e secondaire, maths 6 h : exponentielles, logarithmes, intégrales, probabilités, optimisation.
export const yearSix: VariantMap<
  | 'exponential'
  | 'logarithm'
  | 'integral'
  | 'conditional_probability'
  | 'combinations'
  | 'binomial'
  | 'standardization'
  | 'optimization'
  | 'area_between'
> = {
  exponential: [
    {
      id: 'valeur',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          t = int(2, 6);
        return numeric(
          `Calcule la valeur après ${t} périodes.`,
          `f(t) = ${a} × ${b}ᵗ`,
          a * b ** t,
          [`Remplace t par ${t}.`, `f(${t}) = ${a} × ${power(b, t)} = ${a * b ** t}.`],
          {
            mistakes: [
              {
                value: a * b * t,
                message:
                  'Le facteur est appliqué plusieurs fois : élève-le à une puissance au lieu de le multiplier par le temps.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'interets-composes',
      build({ int, pick }) {
        const capital = pick([100, 200, 500, 1000]),
          rate = int(1, 5),
          years = int(2, 5),
          value = capital * (1 + rate / 100) ** years;
        return numeric(
          'Quelle est la valeur du capital à la fin de la période ?',
          `${capital} € placés à ${rate} % par an, intérêts composés, pendant ${years} ans`,
          value,
          [
            `Chaque année, le capital est multiplié par 1 + ${rate}/100 = ${number(1 + rate / 100)}.`,
            `${capital} × ${number(1 + rate / 100)}${power('', years)} ≈ ${value.toFixed(2).replace('.', ',')} €.`,
          ],
          {
            unit: '€',
            precision: 2,
            hint: 'Arrondis au centime (deux décimales).',
            mistakes: [
              {
                value: Number((capital * (1 + (years * rate) / 100)).toFixed(2)),
                message:
                  'Tu as calculé des intérêts simples. Avec des intérêts composés, les intérêts rapportent à leur tour : multiplie chaque année.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'demi-vie',
      build({ int }) {
        const halfLife = int(2, 10),
          periods = int(2, 4),
          remaining = int(3, 9),
          initial = remaining * 2 ** periods;
        return numeric(
          `Quelle masse reste-t-il après ${halfLife * periods} ans ?`,
          `Masse initiale : ${initial} g ; la masse est divisée par 2 tous les ${halfLife} ans`,
          remaining,
          [
            `${halfLife * periods} ans correspondent à ${periods} demi-vies.`,
            `${initial} : ${power(2, periods)} = ${remaining} g.`,
          ],
          {
            unit: 'g',
            mistakes: [
              {
                value: initial / (2 * periods),
                message: `On divise par 2 à chaque période : par ${power(2, periods)} au total, pas par 2 × ${periods}.`,
              },
            ],
          },
        );
      },
    },
  ],
  logarithm: [
    {
      id: 'exposant',
      build({ int }) {
        const base = int(2, 9),
          exponent = int(2, 6);
        return numeric('Retrouve l’exposant demandé.', `log en base ${base} de ${base ** exponent}`, exponent, [
          `On cherche x tel que ${base}ˣ = ${base ** exponent}.`,
          `${power(base, exponent)} = ${base ** exponent}, donc le logarithme vaut ${exponent}.`,
        ]);
      },
    },
    {
      id: 'equation',
      build({ int, pick }) {
        const base = pick([2, 3, 5]),
          target = int(base + 1, 50),
          answer = Math.log(target) / Math.log(base);
        return numeric(
          'Résous cette équation. Arrondis au millième.',
          `${base}ˣ = ${target}`,
          answer,
          [
            `Applique le logarithme aux deux membres : x × log(${base}) = log(${target}).`,
            `x = log(${target}) / log(${base}) ≈ ${answer.toFixed(3).replace('.', ',')}.`,
          ],
          {
            precision: 3,
            hint: 'Décimal arrondi au millième.',
            mistakes: [
              {
                value: Number((target / base).toFixed(3)),
                message: `x n’est pas ${target} : ${base} : l’inconnue est un exposant, il faut un logarithme.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'puissance-negative',
      build({ int }) {
        const k = int(1, 6);
        return numeric(
          'Calcule ce logarithme décimal.',
          `log(${number(10 ** -k)})`,
          -k,
          [`${number(10 ** -k)} = 10${power('', k).replace(/^/, '⁻')}.`, `Donc log(${number(10 ** -k)}) = ${-k}.`],
          {
            mistakes: [{ value: k, message: 'Un nombre entre 0 et 1 a un logarithme négatif.' }],
          },
        );
      },
    },
  ],
  integral: [
    {
      id: 'lineaire',
      build({ int }) {
        const a = int(2, 9),
          lower = int(0, 3),
          upper = lower + int(2, 6);
        return numeric(
          'Calcule cette intégrale définie.',
          `∫ de ${lower} à ${upper} de ${2 * a}x dx`,
          a * (upper ** 2 - lower ** 2),
          [
            `Une primitive de ${2 * a}x est ${a}x².`,
            `F(${upper}) − F(${lower}) = ${a * upper ** 2} − ${a * lower ** 2} = ${a * (upper ** 2 - lower ** 2)}.`,
          ],
          {
            mistakes: [
              {
                value: a * (upper ** 2 + lower ** 2),
                message: 'Il faut soustraire la valeur à la borne inférieure, pas l’ajouter.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'polynome',
      build({ int }) {
        const a = int(1, 4),
          c = int(1, 6),
          upper = int(1, 4);
        return numeric(
          'Calcule cette intégrale définie.',
          `∫ de 0 à ${upper} de (${formatPolynomial([c, 0, 3 * a])}) dx`,
          a * upper ** 3 + c * upper,
          [
            `Une primitive est F(x) = ${formatPolynomial([0, c, 0, a])}.`,
            `F(${upper}) − F(0) = ${a * upper ** 3} + ${c * upper} = ${a * upper ** 3 + c * upper}.`,
          ],
          {
            mistakes: [
              {
                value: a * upper ** 3 + c,
                message: `Une primitive de la constante ${c} est ${c}x : elle dépend aussi de la borne.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'primitive',
      build({ int, nonZero }) {
        const a = nonZero(-3, 3),
          b = int(-5, 5),
          c = int(-9, 9),
          answer = [0, c, b, a];
        return polynomial(
          'Donne la primitive F de f telle que F(0) = 0.',
          `f(x) = ${formatPolynomial([c, 2 * b, 3 * a])}`,
          answer,
          [
            'Une primitive, c’est l’inverse d’une dérivée : xⁿ devient xⁿ⁺¹ ÷ (n + 1). Avec F(0) = 0, pas de nombre à ajouter au bout.',
            `F(x) = ${formatPolynomial(answer)}. Vérifie : en dérivant, on retrouve f.`,
          ],
          {
            hint: 'Écris par exemple x³ − 2x² + 5x (tu peux commencer par « F(x) = »).',
            mistakes: [
              {
                value: [2 * b, 6 * a],
                message: 'Tu as dérivé f au lieu de chercher une primitive : en dérivant F, on doit retrouver f.',
              },
            ],
          },
        );
      },
    },
  ],
  conditional_probability: [
    {
      id: 'sportifs',
      build({ int }) {
        const tennis = int(2, 9),
          others = int(2, 9),
          group = tennis + others,
          total = group + int(2, 6) + 10;
        return numeric(
          'Un élève est choisi au hasard parmi les sportifs. Quelle est la probabilité qu’il joue au tennis ?',
          `${total} élèves ; ${group} sportifs, dont ${tennis} joueurs de tennis`,
          tennis / group,
          [
            `On choisit seulement parmi les sportifs : ça fait ${group} élèves possibles.`,
            `Parmi eux, ${tennis} jouent au tennis : probabilité = ${tennis}/${group}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: tennis / total,
                message: 'Tu as gardé tous les élèves au dénominateur. La condition restreint le choix aux sportifs.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'tableau',
      build({ int }) {
        const girlsIn = int(2, 9),
          girlsOut = int(2, 9),
          boysIn = int(2, 9),
          boysOut = int(2, 9);
        const total = girlsIn + girlsOut + boysIn + boysOut;
        return numeric(
          'On choisit une fille au hasard. Quelle est la probabilité qu’elle soit interne ?',
          `Filles : ${girlsIn} internes, ${girlsOut} externes ; garçons : ${boysIn} internes, ${boysOut} externes`,
          girlsIn / (girlsIn + girlsOut),
          [
            `On sait que c’est une fille : on choisit parmi les ${girlsIn + girlsOut} filles seulement.`,
            `P(interne | fille) = ${girlsIn}/${girlsIn + girlsOut}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: girlsIn / (girlsIn + boysIn),
                message:
                  'Tu as calculé P(fille | interne) : l’ordre de la condition compte. Ici, on sait déjà que c’est une fille.',
              },
              {
                value: girlsIn / total,
                message:
                  'Tu as calculé P(fille et interne) sur tous les élèves. La condition restreint le choix aux filles.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'formule',
      build({ pick }) {
        const pB = pick([0.2, 0.25, 0.4, 0.5, 0.8]),
          share = pick([0.25, 0.5, 0.75]),
          pAB = pB * share;
        return numeric(
          'Calcule P(A | B).',
          `P(A ∩ B) = ${number(pAB)} ; P(B) = ${number(pB)}`,
          share,
          ['P(A | B) = P(A ∩ B) / P(B).', `${number(pAB)} / ${number(pB)} = ${number(share)}.`],
          {
            ...ratio,
            mistakes: [{ value: pAB * pB, message: 'Il faut diviser par P(B), pas multiplier.' }],
          },
        );
      },
    },
  ],
  combinations: [
    {
      id: 'paires',
      build({ int }) {
        const n = int(2, 9) + 3;
        return numeric(
          'Combien d’équipes de deux personnes peut-on former, sans tenir compte de l’ordre ?',
          `${n} personnes ; 2 à choisir`,
          (n * (n - 1)) / 2,
          [
            `Il y a ${n} × ${n - 1} choix ordonnés de deux personnes distinctes.`,
            `Chaque duo est compté deux fois : ${n * (n - 1)}/2 = ${(n * (n - 1)) / 2}.`,
          ],
          {
            mistakes: [
              {
                value: n * (n - 1),
                message: 'Tu as compté chaque paire dans les deux ordres. Pour une équipe, divise ce nombre par 2.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'ordre',
      build({ int }) {
        const n = int(4, 10);
        return numeric(
          'De combien de façons peut-on choisir un président et un secrétaire, deux personnes différentes ?',
          `${n} candidats`,
          n * (n - 1),
          [
            `${n} choix pour le président, puis ${n - 1} pour le secrétaire.`,
            `Les rôles sont différents, l’ordre compte : ${n} × ${n - 1} = ${n * (n - 1)}.`,
          ],
          {
            mistakes: [
              {
                value: (n * (n - 1)) / 2,
                message:
                  'Ici l’ordre compte : président A et secrétaire B, ce n’est pas l’inverse. Ne divise pas par 2.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'menu',
      build({ int }) {
        const starters = int(2, 5),
          mains = int(2, 6),
          desserts = int(2, 4);
        return numeric(
          'Combien de menus différents « entrée + plat + dessert » peut-on composer ?',
          `${starters} entrées ; ${mains} plats ; ${desserts} desserts`,
          starters * mains * desserts,
          [
            'Chaque entrée peut être associée à chaque plat, puis à chaque dessert.',
            `Chaque choix se combine avec tous les autres, donc on multiplie : ${starters} × ${mains} × ${desserts} = ${starters * mains * desserts}.`,
          ],
          {
            mistakes: [
              {
                value: starters + mains + desserts,
                message: 'Tu as additionné les possibilités. Chaque choix se combine avec tous les autres : multiplie.',
              },
            ],
          },
        );
      },
    },
  ],
  binomial: [
    {
      id: 'un-succes',
      build({ int }) {
        const n = int(2, 7);
        return numeric(
          'Quelle est la probabilité d’obtenir exactement un pile ?',
          `${n} lancers indépendants d’une pièce équilibrée`,
          n / 2 ** n,
          [
            `Un ordre précis a une probabilité (1/2)^${n} = 1/${2 ** n}.`,
            `Le pile peut occuper ${n} positions : P(X = 1) = ${n}/${2 ** n}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: 1 / 2 ** n,
                message:
                  'Tu as calculé la probabilité d’un seul ordre. Le pile peut apparaître à différentes positions.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'k-succes',
      build({ int }) {
        const n = int(3, 6),
          k = int(0, n),
          ways = binomialCoefficient(n, k);
        return numeric(
          `Quelle est la probabilité d’obtenir exactement ${k} pile${k > 1 ? 's' : ''} ?`,
          `${n} lancers indépendants d’une pièce équilibrée`,
          ways / 2 ** n,
          [
            `Chaque suite de résultats a une probabilité 1/${2 ** n}.`,
            `Il y a C(${n} ; ${k}) = ${ways} façons de placer les ${k} piles : P = ${ways}/${2 ** n}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: 1 / 2 ** n,
                message: `Tu as calculé la probabilité d’un seul ordre. Multiplie par le nombre de façons de placer les piles, C(${n} ; ${k}).`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'esperance',
      build({ int, pick }) {
        const n = int(10, 40),
          [top, bottom] = pick([
            [1, 10],
            [1, 5],
            [1, 4],
            [1, 2],
          ] as const),
          p = top / bottom;
        return numeric(
          'Quelle est l’espérance de X ?',
          `X suit une loi binomiale : n = ${n} ; p = ${number(p)}`,
          (n * top) / bottom,
          ['Pour une loi binomiale, E(X) = n × p.', `E(X) = ${n} × ${number(p)} = ${number((n * top) / bottom)}.`],
          {
            mistakes: [
              { value: n * p * (1 - p), message: 'C’est la variance, n × p × (1 − p). L’espérance vaut n × p.' },
            ],
          },
        );
      },
    },
  ],
  standardization: [
    {
      id: 'score-z',
      build({ int }) {
        const mean = int(2, 9) * 10,
          sigma = int(2, 9),
          z = int(-3, 3),
          observed = mean + sigma * z;
        return numeric(
          'Calcule le score centré réduit z.',
          `X = ${observed} ; μ = ${mean} ; σ = ${sigma}`,
          z,
          [
            `Soustrais la moyenne : ${observed} − ${mean} = ${sigma * z}.`,
            `Divise par l’écart-type : z = ${sigma * z}/${sigma} = ${z}.`,
          ],
          {
            mistakes: [
              { value: z / sigma, message: 'Tu as divisé par la variance. Le score z se calcule avec l’écart-type σ.' },
            ],
          },
        );
      },
    },
    {
      id: 'valeur',
      build({ int, nonZero }) {
        const mean = int(2, 9) * 10,
          sigma = int(2, 9),
          z = nonZero(-3, 3);
        return numeric(
          'Quelle valeur X correspond à ce score z ?',
          `z = ${z} ; μ = ${mean} ; σ = ${sigma}`,
          mean + z * sigma,
          ['z = (X − μ)/σ, donc X = μ + z × σ.', `X = ${mean} + (${z}) × ${sigma} = ${mean + z * sigma}.`],
          {
            mistakes: [
              {
                value: mean + z,
                message: 'Le score z compte des écarts-types : multiplie-le par σ avant de l’ajouter à la moyenne.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'comparaison',
      build(tools) {
        const scoreA = tools.int(-2, 2),
          scoreB = scoreA + tools.pick([-1, 1]);
        const meanA = tools.int(5, 7) * 10,
          sigmaA = tools.int(2, 5) * 2,
          meanB = tools.int(5, 7) * 10,
          sigmaB = tools.int(2, 5) * 2;
        const markA = meanA + scoreA * sigmaA,
          markB = meanB + scoreB * sigmaB;
        const better = scoreA > scoreB ? 'L’élève A' : 'L’élève B',
          other = scoreA > scoreB ? 'L’élève B' : 'L’élève A';
        const reason = `Les scores z valent ${scoreA} pour A et ${scoreB} pour B : compare ces scores plutôt que les notes brutes.`;
        return choice(
          tools,
          'Quel élève a le meilleur résultat par rapport à sa classe ?',
          `A : ${markA} (classe : μ = ${meanA}, σ = ${sigmaA}) ; B : ${markB} (classe : μ = ${meanB}, σ = ${sigmaB})`,
          better,
          [
            { value: other, message: reason },
            { value: 'Ils sont à égalité', message: reason },
          ],
          [
            `z(A) = (${markA} − ${meanA})/${sigmaA} = ${scoreA} ; z(B) = (${markB} − ${meanB})/${sigmaB} = ${scoreB}.`,
            'Le plus grand score z indique la meilleure position dans sa classe.',
          ],
        );
      },
    },
  ],
  optimization: [
    {
      id: 'abscisse-du-maximum',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Pour quelle valeur de x cette fonction atteint-elle son maximum sur ℝ ?',
          `f(x) = ${formatPolynomial([0, 2 * a * b, -a])}`,
          b,
          [
            `f′(x) = ${formatPolynomial([2 * a * b, -2 * a])}, qui s’annule pour x = ${b}.`,
            `La dérivée est positive avant ${b}, négative après : c’est bien un maximum.`,
          ],
          {
            mistakes: [
              {
                value: a * b * b,
                message: 'Tu as donné la valeur maximale f(x). On demande la valeur de x où elle est atteinte.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'valeur-maximale',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Quelle est la valeur maximale de cette fonction sur ℝ ?',
          `f(x) = ${formatPolynomial([0, 2 * a * b, -a])}`,
          a * b * b,
          [
            `f′(x) = ${formatPolynomial([2 * a * b, -2 * a])} s’annule pour x = ${b}, où f passe de croissante à décroissante.`,
            `Le maximum vaut f(${b}) = −${a} × ${b * b} + ${2 * a * b} × ${b} = ${a * b * b}.`,
          ],
          {
            mistakes: [
              { value: b, message: 'C’est l’abscisse où le maximum est atteint. On demande la valeur maximale f(x).' },
            ],
          },
        );
      },
    },
    {
      id: 'enclos',
      build({ int }) {
        const side = int(2, 15),
          fence = 4 * side,
          half = fence / 2;
        return numeric(
          `Avec ${fence} m de clôture, on forme un enclos rectangulaire. Quelle est l’aire maximale possible ?`,
          `Largeur x ; longueur ${half} − x`,
          side * side,
          [
            `A(x) = x(${half} − x) et A′(x) = ${half} − 2x, nul pour x = ${side}.`,
            `L’enclos optimal est un carré de ${side} m de côté : A = ${side * side} m².`,
          ],
          {
            unit: 'm²',
            mistakes: [{ value: side, message: 'C’est la largeur optimale. On demande l’aire maximale.' }],
          },
        );
      },
    },
  ],
  area_between: [
    {
      id: 'deux-droites',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Calcule l’aire entre les deux courbes sur l’intervalle indiqué.',
          `f(x) = ${a + b}x ; g(x) = ${b}x ; intervalle [0 ; ${c}]`,
          (a * c * c) / 2,
          [
            `Sur cet intervalle, f ≥ g. La différence vaut ${a}x.`,
            `Une primitive est ${number(a / 2)}x². L’aire vaut ${number(a / 2)} × ${c}² = ${number((a * c * c) / 2)}.`,
          ],
          {
            unit: 'unités²',
            mistakes: [
              {
                value: (-a * c * c) / 2,
                message: 'Tu as soustrait dans le mauvais ordre. Intègre la fonction du dessus moins celle du dessous.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'droite-et-parabole',
      build({ int }) {
        const k = int(1, 6);
        return numeric(
          'Calcule l’aire de l’espace entre la droite et la parabole, entre les deux endroits où elles se croisent.',
          `y = ${formatPolynomial([0, k])} ; y = x²`,
          k ** 3 / 6,
          [
            `Les courbes se coupent en x = 0 et x = ${k}. Entre les deux, la droite est au-dessus.`,
            `Aire = ∫ de 0 à ${k} de (${formatPolynomial([0, k, -1])}) dx = ${number(k ** 3 / 2)} − ${number(k ** 3 / 3)} = ${k ** 3}/6.`,
          ],
          {
            ...ratio,
            unit: 'unités²',
            mistakes: [
              {
                value: k ** 3 / 2,
                message: 'Tu as intégré seulement la droite. Il faut intégrer la différence : droite moins parabole.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'sous-l-axe',
      build({ int }) {
        const m = int(1, 4);
        return numeric(
          'Calcule l’aire de l’espace entre la parabole et l’axe horizontal.',
          `f(x) = ${formatPolynomial([-m * m, 0, 1])}`,
          (4 * m ** 3) / 3,
          [
            `La parabole coupe l’axe en x = −${m} et x = ${m}, et se trouve sous l’axe entre ces deux valeurs.`,
            `Aire = ∫ de −${m} à ${m} de (${formatPolynomial([m * m, 0, -1])}) dx = ${4 * m ** 3}/3.`,
          ],
          {
            ...ratio,
            unit: 'unités²',
            mistakes: [
              {
                value: (-4 * m ** 3) / 3,
                message:
                  'L’intégrale est négative car la courbe est sous l’axe. Une aire est positive : intègre « dessus − dessous ».',
              },
            ],
          },
        );
      },
    },
  ],
};
