import { choice, numeric, polynomial, type VariantMap } from './build.ts';
import { formatPolynomial, number, signed, wrap } from './format.ts';

const pythagoreanTriples = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
] as const;

// 3e secondaire : équations, calcul littéral, Pythagore, fonctions affines, pente, statistiques.
export const yearThree: VariantMap<
  'linear_equation' | 'distributivity' | 'pythagoras' | 'affine' | 'slope' | 'frequency'
> = {
  linear_equation: [
    {
      id: 'ax-plus-b',
      build({ int }) {
        const a = int(2, 9),
          x = int(-6, 8),
          constant = int(-9, 9),
          rhs = a * x + constant;
        return numeric(
          'Résous cette équation.',
          `${a}x ${signed(constant)} = ${rhs}`,
          x,
          [
            `Retire le terme constant ${constant} : ${a}x = ${rhs} − (${constant}) = ${a * x}.`,
            `Divise par ${a} : x = ${x}.`,
          ],
          {
            mistakes: [{ value: a * x, message: `Tu as isolé ${a}x. Il faut encore diviser par ${a}.` }],
          },
        );
      },
    },
    {
      id: 'deux-membres',
      build({ int }) {
        const a = int(3, 9),
          b = int(1, a - 1),
          x = int(-6, 8),
          left = int(-9, 9),
          right = (a - b) * x + left;
        return numeric(
          'Résous cette équation.',
          `${formatPolynomial([left, a])} = ${formatPolynomial([right, b])}`,
          x,
          [
            `Retire ${formatPolynomial([0, b])} des deux membres : ${formatPolynomial([left, a - b])} = ${right}.`,
            `Retire ${left} : ${formatPolynomial([0, a - b])} = ${right - left}, puis divise : x = ${x}.`,
          ],
          {
            mistakes: [
              {
                value: (right - left) / (a + b),
                message: `Pour faire passer ${formatPolynomial([0, b])} à gauche, il faut le retirer des deux membres, pas l’ajouter.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'parentheses',
      build({ int, nonZero }) {
        const a = int(2, 6),
          shift = nonZero(-7, 7),
          x = int(-5, 8),
          rhs = a * (x + shift);
        return numeric(
          'Résous cette équation.',
          `${a}(x ${signed(shift)}) = ${rhs}`,
          x,
          [
            `Divise les deux membres par ${a} : x ${signed(shift)} = ${rhs / a}.`,
            `Isole x : x = ${rhs / a} − (${shift}) = ${x}.`,
          ],
          {
            mistakes: [
              { value: rhs / a + shift, message: `Pour retirer ${shift} d’un membre, applique l’opération contraire.` },
              {
                value: rhs - shift,
                message: `Le facteur ${a} multiplie toute la parenthèse : commence par diviser par ${a}.`,
              },
            ],
          },
        );
      },
    },
  ],
  distributivity: [
    {
      id: 'coefficient',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Après développement et réduction, quel est le coefficient de x ?',
          `${a}(${b}x + ${c}) + ${c}x`,
          a * b + c,
          [
            `Développe : ${a * b}x + ${a * c} + ${c}x.`,
            `Regroupe les termes en x : (${a * b} + ${c})x = ${a * b + c}x. Le coefficient est ${a * b + c}.`,
          ],
          {
            hint: 'Saisis le coefficient de x, sans la lettre x.',
            mistakes: [
              {
                value: a * b,
                message:
                  'Tu as développé correctement le terme en x, mais oublié le terme en x situé après la parenthèse.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'developper',
      build({ int, nonZero }) {
        const a = int(2, 6),
          b = int(1, 6),
          inner = nonZero(-9, 9),
          outer = nonZero(-9, 9);
        const answer = [a * inner + outer, a * b];
        return polynomial(
          'Développe et réduis cette expression.',
          `${a}(${formatPolynomial([inner, b])}) ${signed(outer)}`,
          answer,
          [
            `Multiplie chaque terme de la parenthèse par ${a} : ${a} × ${formatPolynomial([0, b])} = ${formatPolynomial([0, a * b])} et ${a} × (${inner}) = ${a * inner}.`,
            `Regroupe les nombres : ${a * inner} ${signed(outer)} = ${a * inner + outer}. Résultat : ${formatPolynomial(answer)}.`,
          ],
          {
            mistakes: [
              {
                value: [inner + outer, a * b],
                message: `Le facteur ${a} multiplie aussi le terme constant de la parenthèse.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'double-distributivite',
      build({ nonZero }) {
        const p = nonZero(-6, 6),
          q = nonZero(-6, 6),
          answer = [p * q, p + q, 1];
        return polynomial(
          'Développe et réduis ce produit.',
          `(x ${signed(p)})(x ${signed(q)})`,
          answer,
          [
            `Chaque terme de la première parenthèse multiplie chaque terme de la seconde : x·x + x·${wrap(q)} + ${wrap(p)}·x + ${wrap(p)}·${wrap(q)}.`,
            `Regroupe les termes en x : ${formatPolynomial(answer)}.`,
          ],
          {
            mistakes: [
              {
                value: [p * q, 0, 1],
                message: 'Tu as oublié les produits croisés : x multiplie aussi le nombre de l’autre parenthèse.',
              },
            ],
          },
        );
      },
    },
  ],
  pythagoras: [
    {
      id: 'hypotenuse',
      build({ int }) {
        const scale = int(1, 6),
          left = 3 * scale,
          right = 4 * scale;
        return numeric(
          'Trouve l’hypoténuse de ce triangle rectangle.',
          `Côtés de l’angle droit : ${left} cm et ${right} cm`,
          5 * scale,
          [`c² = ${left}² + ${right}² = ${25 * scale * scale}.`, `Prends la racine carrée : c = ${5 * scale} cm.`],
          {
            unit: 'cm',
            mistakes: [
              {
                value: left + right,
                message: 'Pythagore additionne les carrés des longueurs, pas les longueurs elles-mêmes.',
              },
              {
                value: 25 * scale * scale,
                message: 'Tu as trouvé le carré de l’hypoténuse. Il reste à prendre la racine carrée.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'cote-angle-droit',
      build({ int, pick }) {
        const [a, b, c] = pick(pythagoreanTriples),
          k = int(1, 3);
        const known = a * k,
          missing = b * k,
          hypotenuse = c * k;
        return numeric(
          'Trouve le côté manquant de ce triangle rectangle.',
          `Hypoténuse : ${hypotenuse} cm ; un côté de l’angle droit : ${known} cm`,
          missing,
          [
            `Pythagore : ${known}² + b² = ${hypotenuse}², donc b² = ${hypotenuse * hypotenuse} − ${known * known} = ${missing * missing}.`,
            `Prends la racine carrée : b = ${missing} cm.`,
          ],
          {
            unit: 'cm',
            mistakes: [
              {
                value: hypotenuse - known,
                message:
                  'Pythagore travaille avec les carrés des longueurs : soustrais les carrés, puis prends la racine.',
              },
              {
                value: Math.hypot(hypotenuse, known),
                message:
                  'L’hypoténuse est le plus grand côté : pour un côté de l’angle droit, soustrais les carrés au lieu de les additionner.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'reciproque',
      build(tools) {
        const [a, b, c] = tools.pick(pythagoreanTriples),
          k = tools.int(1, 2),
          right = tools.int(0, 1) === 1;
        const x = a * k,
          y = b * k,
          z = c * k + (right ? 0 : 1);
        const check = right
          ? `${x}² + ${y}² = ${x * x + y * y} et ${z}² = ${z * z} : l’égalité est vérifiée.`
          : `${x}² + ${y}² = ${x * x + y * y} mais ${z}² = ${z * z} : l’égalité n’est pas vérifiée.`;
        const yes = 'Oui, il est rectangle',
          no = 'Non, il n’est pas rectangle';
        return choice(
          tools,
          'Ce triangle est-il rectangle ?',
          `Côtés : ${x} cm, ${y} cm et ${z} cm`,
          right ? yes : no,
          [
            {
              value: right ? no : yes,
              message: `Compare le carré du plus grand côté à la somme des deux autres carrés : ${check}`,
            },
            {
              value: 'On ne peut pas savoir sans mesurer les angles',
              message: 'La réciproque de Pythagore permet de conclure avec les seules longueurs.',
            },
          ],
          ['Le plus grand côté serait l’hypoténuse : compare son carré à la somme des carrés des deux autres.', check],
        );
      },
    },
  ],
  affine: [
    {
      id: 'image',
      build({ int }) {
        const a = int(2, 9),
          x = int(-5, 6),
          intercept = int(-8, 8);
        return numeric(`Calcule l’image de ${x}.`, `f(x) = ${formatPolynomial([intercept, a])}`, a * x + intercept, [
          `Remplace x par ${x} : f(${x}) = ${a} × (${x}) ${signed(intercept)}.`,
          `On obtient ${a * x + intercept}.`,
        ]);
      },
    },
    {
      id: 'antecedent',
      build({ int }) {
        const a = int(2, 9),
          x = int(-5, 6),
          intercept = int(-8, 8),
          image = a * x + intercept;
        return numeric(
          `Trouve le nombre dont l’image vaut ${image}.`,
          `f(x) = ${formatPolynomial([intercept, a])}`,
          x,
          [
            `On cherche x tel que ${formatPolynomial([intercept, a])} = ${image}.`,
            `${a}x = ${image} − (${intercept}) = ${image - intercept}, donc x = ${x}.`,
          ],
          {
            mistakes: [
              {
                value: a * image + intercept,
                message: `Tu as calculé l’image de ${image}. On cherche le nombre de départ, son antécédent.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'sens-de-variation',
      build(tools) {
        const slope = tools.int(-4, 4),
          intercept = tools.nonZero(-8, 8);
        const labels = { up: 'Croissante', down: 'Décroissante', flat: 'Constante' };
        const correct = slope > 0 ? labels.up : slope < 0 ? labels.down : labels.flat;
        const reason = `C’est le coefficient de x, ici ${slope}, qui décide du sens de variation, pas le terme constant.`;
        return choice(
          tools,
          'Comment varie cette fonction ?',
          `f(x) = ${formatPolynomial([intercept, slope])}`,
          correct,
          Object.values(labels)
            .filter(label => label !== correct)
            .map(value => ({ value, message: reason })),
          [
            `Le coefficient de x vaut ${slope}.`,
            slope > 0
              ? 'Il est positif : quand x augmente, f(x) augmente.'
              : slope < 0
                ? 'Il est négatif : quand x augmente, f(x) diminue.'
                : 'Il est nul : f(x) garde toujours la même valeur.',
          ],
        );
      },
    },
  ],
  slope: [
    {
      id: 'deux-points',
      build({ int }) {
        const step = int(2, 6),
          slope = int(-4, 4),
          x1 = int(-3, 3),
          y1 = int(-5, 5),
          x2 = x1 + step,
          y2 = y1 + slope * step;
        return numeric(
          'Calcule le coefficient directeur de la droite AB.',
          `A(${x1} ; ${y1}), B(${x2} ; ${y2})`,
          slope,
          [
            `Variation verticale : ${y2} − (${y1}) = ${slope * step}. Variation horizontale : ${x2} − (${x1}) = ${step}.`,
            `La pente est ${slope * step}/${step} = ${slope}.`,
          ],
          {
            mistakes:
              slope !== 0
                ? [
                    {
                      value: 1 / slope,
                      message: 'Tu as inversé le rapport. La pente est variation verticale / variation horizontale.',
                    },
                  ]
                : [],
          },
        );
      },
    },
    {
      id: 'equation-a-isoler',
      build({ int, nonZero }) {
        const k = int(2, 5),
          slope = nonZero(-5, 5),
          intercept = int(-6, 6);
        return numeric(
          'Quel est le coefficient directeur de cette droite ?',
          `${k}y = ${formatPolynomial([k * intercept, k * slope])}`,
          slope,
          [
            `Isole y en divisant les deux membres par ${k}.`,
            `y = ${formatPolynomial([intercept, slope])} : le coefficient directeur est ${slope}.`,
          ],
          {
            mistakes: [{ value: k * slope, message: `Isole d’abord y : divise les deux membres par ${k}.` }],
          },
        );
      },
    },
    {
      id: 'equation-de-droite',
      build({ int, nonZero }) {
        const slope = nonZero(-4, 4),
          intercept = int(-6, 6),
          x1 = nonZero(-3, 3),
          x2 = x1 + int(1, 3);
        const y1 = slope * x1 + intercept,
          y2 = slope * x2 + intercept;
        return polynomial(
          'Donne l’équation de la droite AB, sous la forme y = mx + p.',
          `A(${x1} ; ${y1}), B(${x2} ; ${y2})`,
          [intercept, slope],
          [
            `m = (${y2} − (${y1}))/(${x2} − (${x1})) = ${slope}.`,
            `p = y_A − m·x_A = ${y1} − (${slope}) × (${x1}) = ${intercept}. Donc y = ${formatPolynomial([intercept, slope])}.`,
          ],
          {
            hint: 'Écris par exemple y = 2x − 3 (tu peux omettre « y = »).',
            mistakes: [
              {
                value: [y1, slope],
                message: 'Tu as pris l’ordonnée de A comme ordonnée à l’origine. Calcule p avec p = y_A − m·x_A.',
              },
            ],
          },
        );
      },
    },
  ],
  frequency: [
    {
      id: 'pourcentage',
      build({ int }) {
        const total = 20,
          count = int(2, 9);
        return numeric(
          'Exprime la fréquence en pourcentage.',
          `${count} élèves sur ${total} viennent à vélo.`,
          (count / total) * 100,
          [`La fréquence vaut ${count}/${total}.`, `Multiplie par 100 : ${(count / total) * 100} %.`],
          {
            unit: '%',
            hint: 'Saisis le pourcentage sans le symbole %.',
            mistakes: [
              {
                value: count / total,
                message: 'Tu as la fréquence décimale. Multiplie-la par 100 pour répondre en pourcentage.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'effectif',
      build({ pick }) {
        const total = pick([20, 40, 60, 80]),
          percent = pick([5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75]),
          count = (total * percent) / 100;
        return numeric(
          'Combien d’élèves viennent à pied ?',
          `${total} élèves ; ${percent} % viennent à pied`,
          count,
          [
            `${percent} % de ${total}, c’est ${total} × ${percent}/100.`,
            `${total} × ${percent} : 100 = ${count} élèves.`,
          ],
          {
            hint: 'Saisis un nombre d’élèves.',
            mistakes: [
              { value: percent, message: 'C’est le pourcentage. On demande le nombre d’élèves correspondant.' },
            ],
          },
        );
      },
    },
    {
      id: 'tableau',
      build({ int, pick }) {
        const total = pick([20, 25, 40, 50]),
          most = total / 5;
        const bus = int(1, most),
          bike = int(1, most),
          walk = int(1, most),
          car = total - bus - bike - walk;
        return numeric(
          'Quelle est la fréquence, en pourcentage, des élèves qui viennent à pied ?',
          `Bus : ${bus} ; vélo : ${bike} ; à pied : ${walk} ; voiture : ${car}`,
          (walk * 100) / total,
          [
            `L’effectif total vaut ${bus} + ${bike} + ${walk} + ${car} = ${total}.`,
            `Fréquence : ${walk}/${total} = ${number(walk / total)}, soit ${number((walk * 100) / total)} %.`,
          ],
          {
            unit: '%',
            hint: 'Saisis le pourcentage sans le symbole %.',
            mistakes: [
              { value: walk, message: 'C’est l’effectif. La fréquence le compare à l’effectif total.' },
              {
                value: walk / total,
                message: 'Tu as la fréquence décimale. Multiplie-la par 100 pour répondre en pourcentage.',
              },
            ],
          },
        );
      },
    },
  ],
};
