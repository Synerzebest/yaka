import { choice, numeric, ratio, type VariantMap } from './build.ts';
import { formatPolynomial, rootFactor, signed, vertexForm, wrap } from './format.ts';

const triples = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
] as const;

// 4e secondaire : second degré, systèmes, trigonométrie, similitudes, paraboles, probabilités.
export const yearFour: VariantMap<
  'quadratic_roots' | 'system' | 'sine_ratio' | 'similarity' | 'vertex' | 'probability'
> = {
  quadratic_roots: [
    {
      id: 'produit-nul',
      build({ int }) {
        const root1 = int(-6, 3),
          root2 = root1 + int(2, 6);
        return numeric(
          'Donne la plus grande solution réelle.',
          `${rootFactor(root1)}${rootFactor(root2)} = 0`,
          root2,
          [
            'Un produit nul a au moins un facteur nul.',
            `Les racines sont ${root1} et ${root2}. La plus grande est ${root2}.`,
          ],
          {
            mistakes: [{ value: root1, message: 'C’est bien une racine, mais on demande la plus grande des deux.' }],
          },
        );
      },
    },
    {
      id: 'forme-developpee',
      build({ int, nonZero }) {
        const small = nonZero(-6, 4),
          large = small + int(1, 6);
        const expanded = formatPolynomial([small * large, -(small + large), 1]);
        return numeric(
          'Donne la plus petite solution réelle.',
          `${expanded} = 0`,
          small,
          [
            `Cherche deux nombres de somme ${small + large} et de produit ${small * large} : ${small} et ${large}.`,
            `${expanded} = ${rootFactor(small)}${rootFactor(large)}. La plus petite solution est ${small}.`,
          ],
          {
            mistakes: [
              { value: -small, message: 'Attention au signe : si x − r = 0, alors x = r.' },
              { value: large, message: 'C’est bien une solution, mais on demande la plus petite des deux.' },
            ],
          },
        );
      },
    },
    {
      id: 'nombre-de-solutions',
      build(tools) {
        const cases = [
          () => {
            const r = tools.int(-6, 3),
              s = r + tools.int(1, 6);
            return [r * s, -(r + s), 1];
          },
          () => {
            const r = tools.nonZero(-5, 5);
            return [r * r, -2 * r, 1];
          },
          () => {
            const b = tools.int(-4, 4);
            return [Math.floor((b * b) / 4) + tools.int(1, 5), b, 1];
          },
        ];
        const [c, b, a] = cases[tools.int(0, 2)]();
        const delta = b * b - 4 * a * c;
        const labels = ['Aucune solution réelle', 'Une seule solution', 'Deux solutions'];
        const correct = labels[delta < 0 ? 0 : delta === 0 ? 1 : 2];
        const reason = `Calcule le discriminant : Δ = ${wrap(b)}² − 4 × ${a} × ${wrap(c)} = ${delta}.`;
        return choice(
          tools,
          'Combien de solutions réelles cette équation a-t-elle ?',
          `${formatPolynomial([c, b, a])} = 0`,
          correct,
          labels.filter(label => label !== correct).map(value => ({ value, message: reason })),
          [
            `Δ = b² − 4ac = ${wrap(b)}² − 4 × ${a} × ${wrap(c)} = ${delta}.`,
            delta < 0
              ? 'Δ < 0 : aucune solution réelle.'
              : delta === 0
                ? 'Δ = 0 : une seule solution (racine double).'
                : 'Δ > 0 : deux solutions distinctes.',
          ],
        );
      },
    },
  ],
  system: [
    {
      id: 'combinaison',
      build({ int }) {
        const x = int(-5, 8),
          y = int(-4, 7);
        return numeric(
          'Résous le système et donne uniquement x.',
          `x + y = ${x + y} ; x − y = ${x - y}`,
          x,
          [
            `Additionne les deux équations : 2x = ${x + y} + (${x - y}) = ${2 * x}.`,
            `Divise par 2 : x = ${x}. Puis y = ${y} pour vérifier.`,
          ],
          { hint: 'Saisis seulement x.' },
        );
      },
    },
    {
      id: 'substitution',
      build({ int }) {
        const x = int(-4, 6),
          m = int(1, 4),
          q = int(-5, 5),
          sum = x + m * x + q;
        return numeric(
          'Résous le système et donne uniquement x.',
          `y = ${formatPolynomial([q, m])} ; x + y = ${sum}`,
          x,
          [
            `Remplace y dans la seconde équation : x + ${formatPolynomial([q, m])} = ${sum}.`,
            `${m + 1}x = ${sum} − (${q}) = ${sum - q}, donc x = ${x}.`,
          ],
          {
            hint: 'Saisis seulement x.',
            mistakes: [{ value: m * x + q, message: 'C’est la valeur de y. On demande x.' }],
          },
        );
      },
    },
    {
      id: 'probleme',
      build({ int }) {
        const adult = int(8, 12),
          child = int(4, 7),
          first = 2 * adult + 3 * child,
          second = adult + child;
        return numeric(
          `Au cinéma, 2 places adultes et 3 places enfants coûtent ${first} €. Une place adulte et une place enfant coûtent ${second} €. Quel est le prix d’une place enfant ?`,
          `2a + 3e = ${first} ; a + e = ${second}`,
          child,
          [
            `Multiplie la seconde équation par 2 : 2a + 2e = ${2 * second}.`,
            `Soustrais-la de la première : e = ${first} − ${2 * second} = ${child} €.`,
          ],
          {
            unit: '€',
            mistakes: [
              { value: adult, message: 'C’est le prix d’une place adulte. On demande celui d’une place enfant.' },
            ],
          },
        );
      },
    },
  ],
  sine_ratio: [
    {
      id: 'sinus',
      build({ int }) {
        const k = int(2, 9);
        return numeric(
          'Calcule sin(α) dans ce triangle rectangle.',
          `Côté opposé à α : ${3 * k} ; hypoténuse : ${5 * k}`,
          3 / 5,
          [`sin(α) = opposé / hypoténuse = ${3 * k}/${5 * k}.`, 'Simplifie : 3/5 = 0,6.'],
          {
            ...ratio,
            mistakes: [
              { value: 5 / 3, message: 'Tu as inversé le rapport. Le sinus d’un angle aigu ne peut pas dépasser 1.' },
            ],
          },
        );
      },
    },
    {
      id: 'cosinus',
      build({ int, pick }) {
        const [a, b, c] = pick(triples),
          k = int(1, 3),
          opposite = a * k,
          adjacent = b * k,
          hypotenuse = c * k;
        return numeric(
          'Calcule cos(α) dans ce triangle rectangle.',
          `Côté adjacent à α : ${adjacent} ; côté opposé : ${opposite} ; hypoténuse : ${hypotenuse}`,
          b / c,
          [`cos(α) = adjacent / hypoténuse = ${adjacent}/${hypotenuse}.`, `Simplifie : ${b}/${c}.`],
          {
            ...ratio,
            mistakes: [
              { value: a / c, message: 'Tu as calculé le sinus (côté opposé). Le cosinus utilise le côté adjacent.' },
              { value: c / b, message: 'Tu as inversé le rapport. Le cosinus d’un angle aigu ne peut pas dépasser 1.' },
            ],
          },
        );
      },
    },
    {
      id: 'cote-oppose',
      build({ int, pick }) {
        const [top, bottom] = pick([
            [3, 5],
            [4, 5],
            [5, 13],
            [12, 13],
            [8, 17],
          ] as const),
          k = int(1, 4),
          hypotenuse = bottom * k;
        return numeric(
          'Calcule la longueur du côté opposé à α.',
          `Hypoténuse : ${hypotenuse} cm ; sin(α) = ${top}/${bottom}`,
          top * k,
          [
            `sin(α) = opposé / hypoténuse, donc opposé = hypoténuse × sin(α).`,
            `Opposé = ${hypotenuse} × ${top}/${bottom} = ${top * k} cm.`,
          ],
          {
            unit: 'cm',
            mistakes: [
              {
                value: (hypotenuse * bottom) / top,
                message: 'Tu as divisé par le sinus. Comme opposé = hypoténuse × sin(α), il faut multiplier.',
              },
            ],
          },
        );
      },
    },
  ],
  similarity: [
    {
      id: 'longueur',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Les deux triangles sont semblables. Trouve la longueur correspondante.',
          `Un côté ${a} cm → ${a * c} cm ; un autre ${b} cm → ?`,
          b * c,
          [`Le facteur d’agrandissement est ${a * c}/${a} = ${c}.`, `L’autre côté devient ${b} × ${c} = ${b * c} cm.`],
          {
            unit: 'cm',
            mistakes: [
              {
                value: b * c * c,
                message:
                  'Tu as utilisé le carré du facteur, qui concerne les aires. Une longueur est multipliée par le facteur seul.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'rapport-reduction',
      build({ int }) {
        const side = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Ce triangle est réduit. Quel est le rapport de réduction ?',
          `Un côté de ${side * c} cm devient ${side} cm`,
          1 / c,
          [
            'Le rapport vaut longueur de l’image / longueur de départ.',
            `${side}/${side * c} = 1/${c}. Une réduction a un rapport inférieur à 1.`,
          ],
          {
            ...ratio,
            mistakes: [
              { value: c, message: 'Tu as divisé dans le mauvais ordre : une réduction a un rapport inférieur à 1.' },
            ],
          },
        );
      },
    },
    {
      id: 'aire',
      build({ int }) {
        const area = int(3, 20),
          k = int(2, 4);
        return numeric(
          'Une figure est agrandie. Quelle est sa nouvelle aire ?',
          `Aire de départ : ${area} cm² ; rapport d’agrandissement : ${k}`,
          area * k * k,
          [
            `Les longueurs sont multipliées par ${k}, donc les aires par ${k}² = ${k * k}.`,
            `${area} × ${k * k} = ${area * k * k} cm².`,
          ],
          {
            unit: 'cm²',
            mistakes: [
              {
                value: area * k,
                message: `Une aire dépend de deux longueurs : elle est multipliée par ${k}², pas par ${k}.`,
              },
            ],
          },
        );
      },
    },
  ],
  vertex: [
    {
      id: 'abscisse',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          vertex = int(-4, 5),
          linear = -2 * a * vertex;
        return numeric('Trouve l’abscisse du sommet.', `f(x) = ${formatPolynomial([b, linear, a])}`, vertex, [
          'Le sommet est sur l’axe de symétrie du U : pour ax² + bx + c, il est en x = −b ÷ (2a).',
          `Ici xₛ = −(${linear})/(2 × ${a}) = ${vertex}.`,
        ]);
      },
    },
    {
      id: 'forme-canonique',
      build({ int, nonZero }) {
        const a = nonZero(-3, 3),
          h = nonZero(-5, 5),
          k = int(-6, 6);
        return numeric(
          'Trouve l’abscisse du sommet de cette parabole.',
          `f(x) = ${vertexForm(a, h, k)}`,
          h,
          [
            'Sous la forme a(x − h)² + k, le sommet est le point (h ; k).',
            `Ici (x ${signed(-h)}) = (x − (${h})) : h = ${h}.`,
          ],
          {
            mistakes: [
              { value: -h, message: 'Attention au signe : dans a(x − h)², le sommet est en x = h.' },
              { value: k, message: 'C’est l’ordonnée du sommet. On demande son abscisse.' },
            ],
          },
        );
      },
    },
    {
      id: 'maximum-ou-minimum',
      build(tools) {
        const a = tools.nonZero(-4, 4),
          b = tools.int(-6, 6),
          c = tools.int(-5, 5);
        const minimum = 'Un minimum',
          maximum = 'Un maximum';
        const reason = `Le coefficient de x² vaut ${a} : il est ${a > 0 ? 'positif, la parabole est tournée vers le haut' : 'négatif, la parabole est tournée vers le bas'}.`;
        return choice(
          tools,
          'Cette fonction admet-elle un maximum ou un minimum ?',
          `f(x) = ${formatPolynomial([c, b, a])}`,
          a > 0 ? minimum : maximum,
          [
            { value: a > 0 ? maximum : minimum, message: reason },
            {
              value: 'Ni l’un ni l’autre',
              message: 'Une parabole a toujours un sommet, qui est un maximum ou un minimum.',
            },
          ],
          ['C’est le signe du coefficient de x² qui décide.', reason],
        );
      },
    },
  ],
  probability: [
    {
      id: 'billes',
      build({ int }) {
        const red = int(2, 9),
          blue = int(2, 9);
        return numeric(
          'Toutes les billes ont la même chance. Quelle est la probabilité de tirer une rouge ?',
          `${red} rouges et ${blue} bleues`,
          red / (red + blue),
          [`Il y a ${red + blue} billes au total et ${red} rouges.`, `P(rouge) = ${red}/${red + blue}.`],
          {
            ...ratio,
            mistakes: [
              {
                value: red / blue,
                message: 'Le dénominateur doit compter toutes les billes, pas seulement les bleues.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'de',
      build({ int }) {
        const k = int(1, 5);
        return numeric(
          `On lance un dé équilibré à 6 faces. Quelle est la probabilité d’obtenir un nombre strictement supérieur à ${k} ?`,
          `Issues favorables : ${k + 1} à 6`,
          (6 - k) / 6,
          [
            `Les issues favorables sont ${Array.from({ length: 6 - k }, (_, index) => k + 1 + index).join(', ')} : il y en a ${6 - k}.`,
            `P = ${6 - k}/6.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: k / 6,
                message: `Tu as compté les issues inférieures ou égales à ${k}. On demande l’événement contraire.`,
              },
              { value: (7 - k) / 6, message: `« Strictement supérieur » exclut ${k} lui-même.` },
            ],
          },
        );
      },
    },
    {
      id: 'contraire',
      build({ int }) {
        const red = int(2, 9),
          green = int(2, 9),
          blue = int(2, 9),
          total = red + green + blue;
        return numeric(
          'Quelle est la probabilité de ne pas tirer une bille bleue ?',
          `${red} rouges, ${green} vertes et ${blue} bleues`,
          (red + green) / total,
          [`P(bleue) = ${blue}/${total}.`, `P(pas bleue) = 1 − ${blue}/${total} = ${red + green}/${total}.`],
          {
            ...ratio,
            mistakes: [
              {
                value: blue / total,
                message: 'C’est la probabilité de tirer une bleue. On demande l’événement contraire.',
              },
            ],
          },
        );
      },
    },
  ],
};
