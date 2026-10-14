import { choice, numeric, polynomial, ratio, type VariantMap } from './build.ts';
import { formatPolynomial, number, piFraction, power, signed, term } from './format.ts';

const piAngles = [
  [1, 6],
  [1, 4],
  [1, 3],
  [1, 2],
  [2, 3],
  [3, 4],
  [5, 6],
  [1, 1],
  [7, 6],
  [5, 4],
  [3, 2],
  [2, 1],
] as const;

// 5e secondaire, maths 6 h : suites, trigonométrie, produit scalaire, limites, dérivées.
export const yearFive: VariantMap<
  | 'arithmetic_sequence'
  | 'geometric_sequence'
  | 'radians'
  | 'unit_circle'
  | 'dot_product'
  | 'removable_limit'
  | 'rational_limit'
  | 'derivative'
  | 'tangent'
> = {
  arithmetic_sequence: [
    {
      id: 'terme',
      build({ int }) {
        const first = int(2, 9),
          r = int(2, 9),
          n = int(2, 6);
        return numeric(
          `Calcule ${term(n)}.`,
          `${term(0)} = ${first} ; raison r = ${r}`,
          first + n * r,
          [
            `L’indice de départ est 0 : il faut ${n} passages.`,
            `${term(n)} = ${first} + ${n} × ${r} = ${first + n * r}.`,
          ],
          {
            mistakes: [
              {
                value: first + (n - 1) * r,
                message: 'La suite commence à u₀. Pour atteindre ce terme, il faut autant de passages que son indice.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'raison',
      build({ int, nonZero }) {
        const first = int(-5, 9),
          r = nonZero(-5, 6),
          n = int(3, 8),
          last = first + n * r;
        return numeric(
          'Trouve la raison r de cette suite arithmétique.',
          `${term(0)} = ${first} ; ${term(n)} = ${last}`,
          r,
          [
            `Entre ${term(0)} et ${term(n)}, on ajoute ${n} fois la raison : ${last} − (${first}) = ${n * r}.`,
            `r = ${n * r} : ${n} = ${r}.`,
          ],
          {
            mistakes: [
              { value: last - first, message: `C’est l’écart total. Il correspond à ${n} pas : divise par ${n}.` },
              {
                value: (last - first) / (n + 1),
                message: `Entre ${term(0)} et ${term(n)}, il y a ${n} pas, pas ${n + 1}.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'somme',
      build({ int }) {
        const first = int(1, 9),
          r = int(1, 5),
          n = int(5, 10),
          last = first + (n - 1) * r;
        return numeric(
          `Calcule la somme des ${n} premiers termes, de ${term(0)} à ${term(n - 1)}.`,
          `${term(0)} = ${first} ; raison r = ${r}`,
          (n * (first + last)) / 2,
          [
            `Le dernier terme vaut ${term(n - 1)} = ${first} + ${n - 1} × ${r} = ${last}.`,
            `S = nombre de termes × (premier + dernier) / 2 = ${n} × (${first} + ${last}) / 2 = ${number((n * (first + last)) / 2)}.`,
          ],
          {
            mistakes: [
              {
                value: n * (first + last),
                message: 'Tu as oublié de diviser par 2 : chaque paire « premier + dernier » est comptée deux fois.',
              },
            ],
          },
        );
      },
    },
  ],
  geometric_sequence: [
    {
      id: 'terme',
      build({ int }) {
        const first = int(2, 9),
          q = int(2, 9),
          n = int(2, 6);
        return numeric(
          `Calcule ${term(n)}.`,
          `${term(0)} = ${first} ; raison q = ${q}`,
          first * q ** n,
          [`Tu multiplies ${n} fois par ${q}.`, `${term(n)} = ${first} × ${power(q, n)} = ${first * q ** n}.`],
          {
            mistakes: [
              {
                value: first + n * q,
                message:
                  'Tu as utilisé une formule de suite arithmétique. Ici, on multiplie par la raison à chaque étape.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'raison',
      build({ int, pick }) {
        const q = pick([2, 3, 4, -2, -3, 1 / 2]),
          value = 4 * int(1, 6),
          next = value * q;
        return numeric(
          'Trouve la raison q de cette suite géométrique.',
          `${term(3)} = ${value} ; ${term(4)} = ${number(next)}`,
          q,
          [
            `On passe d’un terme au suivant en multipliant par q : q = ${term(4)} / ${term(3)}.`,
            `q = ${number(next)} / ${value} = ${number(q)}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: next - value,
                message:
                  'Tu as calculé une différence, comme pour une suite arithmétique. Ici, on divise un terme par le précédent.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'somme',
      build({ int }) {
        const first = int(1, 5),
          q = int(2, 3),
          n = int(3, 6),
          sum = (first * (q ** n - 1)) / (q - 1);
        return numeric(
          `Calcule la somme des ${n} premiers termes, de ${term(0)} à ${term(n - 1)}.`,
          `${term(0)} = ${first} ; raison q = ${q}`,
          sum,
          [
            `S = ${term(0)} × (qⁿ − 1)/(q − 1) avec n = ${n} termes.`,
            `S = ${first} × (${power(q, n)} − 1)/(${q} − 1) = ${sum}.`,
          ],
          {
            mistakes: [
              {
                value: first * q ** (n - 1),
                message: `C’est seulement le dernier terme, ${term(n - 1)}. On demande la somme de tous les termes.`,
              },
            ],
          },
        );
      },
    },
  ],
  radians: [
    {
      id: 'vers-radians',
      build({ pick }) {
        const degrees = pick([30, 45, 60, 90, 120, 135, 150, 180, 210, 270]);
        return numeric(
          'Convertis en radians et donne le coefficient de π.',
          `${degrees}° = kπ rad ; k = ?`,
          degrees / 180,
          [`Multiplie par π/180 : ${degrees}° = (${degrees}/180)π.`, `Le coefficient demandé est ${degrees}/180.`],
          { ...ratio, hint: 'Saisis k uniquement, par exemple 2/3 pour 2π/3.' },
        );
      },
    },
    {
      id: 'vers-degres',
      build({ pick }) {
        const [top, bottom] = pick(piAngles),
          degrees = (180 * top) / bottom;
        return numeric(
          'Convertis cet angle en degrés.',
          `${piFraction(top, bottom)} rad = ? °`,
          degrees,
          ['π rad correspond à 180°.', `${piFraction(top, bottom)} rad = ${top}/${bottom} × 180° = ${degrees}°.`],
          {
            unit: '°',
            mistakes: [
              { value: 2 * degrees, message: 'π rad vaut 180°, pas 360° : c’est 2π qui correspond à un tour complet.' },
            ],
          },
        );
      },
    },
    {
      id: 'longueur-arc',
      build({ int, pick }) {
        const radius = int(2, 9),
          [top, bottom] = pick(piAngles);
        return numeric(
          'Quelle est la longueur de l’arc ? Donne le coefficient de π.',
          `Rayon : ${radius} cm ; angle au centre : ${piFraction(top, bottom)} rad ; ℓ = kπ cm ; k = ?`,
          (radius * top) / bottom,
          [
            'En radians, la longueur d’un arc vaut ℓ = r × θ.',
            `ℓ = ${radius} × ${piFraction(top, bottom)} : k = ${radius} × ${top}/${bottom} = ${number((radius * top) / bottom)}.`,
          ],
          {
            ...ratio,
            hint: 'Saisis k uniquement, par exemple 5/2 pour 5π/2.',
            mistakes: [
              { value: top / bottom, message: 'Tu as donné l’angle. La longueur de l’arc vaut rayon × angle.' },
            ],
          },
        );
      },
    },
  ],
  unit_circle: [
    {
      id: 'sinus',
      build({ int }) {
        const index = int(0, 7),
          angles = ['0', 'π/6', 'π/2', '5π/6', 'π', '7π/6', '3π/2', '11π/6'],
          values = [0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5];
        return numeric(
          'Donne la valeur exacte de ce sinus.',
          `sin(${angles[index]}) = ?`,
          values[index],
          [
            'Le sinus est l’ordonnée du point sur le cercle trigonométrique.',
            `À l’angle ${angles[index]}, cette ordonnée vaut ${number(values[index])}.`,
          ],
          { hint: 'Un nombre ou une fraction exacte.' },
        );
      },
    },
    {
      id: 'cosinus',
      build({ int }) {
        const index = int(0, 7),
          angles = ['0', 'π/3', 'π/2', '2π/3', 'π', '4π/3', '3π/2', '5π/3'],
          values = [1, 0.5, 0, -0.5, -1, -0.5, 0, 0.5];
        return numeric(
          'Donne la valeur exacte de ce cosinus.',
          `cos(${angles[index]}) = ?`,
          values[index],
          [
            'Le cosinus est l’abscisse du point sur le cercle trigonométrique.',
            `À l’angle ${angles[index]}, cette abscisse vaut ${number(values[index])}.`,
          ],
          {
            hint: 'Un nombre ou une fraction exacte.',
            mistakes: [
              {
                value: -values[index],
                message: 'Vérifie le signe : à gauche de l’axe vertical, le cosinus est négatif.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'signes',
      build(tools) {
        const [angle, quadrant] = tools.pick([
          ['π/6', 1],
          ['π/4', 1],
          ['2π/3', 2],
          ['3π/4', 2],
          ['7π/6', 3],
          ['5π/4', 3],
          ['5π/3', 4],
          ['7π/4', 4],
        ] as const);
        const labels = ['sin > 0 et cos > 0', 'sin > 0 et cos < 0', 'sin < 0 et cos < 0', 'sin < 0 et cos > 0'];
        const reason = `L’angle ${angle} se trouve dans le quadrant ${quadrant} : regarde le signe de l’abscisse (cos) et de l’ordonnée (sin).`;
        return choice(
          tools,
          'Quels sont les signes du sinus et du cosinus de cet angle ?',
          `θ = ${angle}`,
          labels[quadrant - 1],
          labels.filter((_, index) => index !== quadrant - 1).map(value => ({ value, message: reason })),
          [reason, 'Quadrant 1 : (+ ; +), quadrant 2 : cos < 0, quadrant 3 : (− ; −), quadrant 4 : sin < 0.'],
        );
      },
    },
  ],
  dot_product: [
    {
      id: 'coordonnees',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          y = int(-6, 6),
          z = int(-6, 6);
        return numeric(
          'Calcule le produit scalaire dans un repère orthonormé.',
          `u = (${a} ; ${y}) ; v = (${b} ; ${z})`,
          a * b + y * z,
          [
            `Multiplie les coordonnées correspondantes : ${a} × ${b} et (${y}) × (${z}).`,
            `Additionne : ${a * b} + (${y * z}) = ${a * b + y * z}.`,
          ],
        );
      },
    },
    {
      id: 'normes-et-angle',
      build({ int, pick }) {
        const a = int(2, 9),
          b = int(2, 9),
          [angle, cosine] = pick([
            [0, 1],
            [60, 0.5],
            [90, 0],
            [120, -0.5],
            [180, -1],
          ] as const);
        return numeric(
          'Calcule le produit scalaire u · v.',
          `‖u‖ = ${a} ; ‖v‖ = ${b} ; angle entre u et v : ${angle}°`,
          a * b * cosine,
          [
            'u · v = ‖u‖ × ‖v‖ × cos(angle).',
            `${a} × ${b} × cos(${angle}°) = ${a * b} × ${number(cosine)} = ${number(a * b * cosine)}.`,
          ],
          {
            mistakes: [
              {
                value: a * b,
                message: 'Tu as multiplié les normes sans tenir compte de l’angle : multiplie aussi par son cosinus.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'orthogonalite',
      build({ int, nonZero }) {
        const p = int(1, 4),
          t = nonZero(-3, 3),
          r = int(1, 5),
          m = p * t,
          q = -t * r;
        return numeric(
          'Trouve m pour que les vecteurs u et v soient orthogonaux.',
          `u = (${p} ; m) ; v = (${q} ; ${r})`,
          m,
          [
            `u · v = ${p} × (${q}) + m × ${r} = ${p * q} + ${r}m.`,
            `Orthogonaux signifie u · v = 0 : ${r}m = ${-p * q}, donc m = ${m}.`,
          ],
          {
            mistakes: [
              { value: -m, message: 'Vérifie le signe : avec cette valeur, le produit scalaire ne s’annule pas.' },
            ],
          },
        );
      },
    },
  ],
  removable_limit: [
    {
      id: 'difference-de-carres',
      build({ int }) {
        const a = int(2, 9);
        return numeric(
          'Calcule cette limite.',
          `lim x → ${a} : (x² − ${a * a}) / (x − ${a})`,
          2 * a,
          [
            `Factorise x² − ${a * a} = (x − ${a})(x + ${a}).`,
            `Pour x ≠ ${a}, simplifie : x + ${a}. Quand x → ${a}, la limite vaut ${2 * a}.`,
          ],
          {
            mistakes: [
              {
                value: 0,
                message:
                  'Remplacer x directement donne 0/0, et 0/0 n’est pas égal à 0 ! Simplifie d’abord, puis regarde de quoi tu t’approches.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'trinome',
      build({ int }) {
        const a = int(1, 6),
          b = int(1, 6),
          numerator = formatPolynomial([-a * b, b - a, 1]);
        return numeric(
          'Calcule cette limite.',
          `lim x → ${a} : (${numerator}) / (x − ${a})`,
          a + b,
          [
            `${a} annule le numérateur : il se factorise par (x − ${a}). ${numerator} = (x − ${a})(x + ${b}).`,
            `Pour x ≠ ${a}, il reste x + ${b}, qui tend vers ${a + b}.`,
          ],
          {
            mistakes: [
              {
                value: 0,
                message:
                  'Remplacer x directement donne 0/0, et 0/0 n’est pas égal à 0 ! Factorise le haut par (x − a), puis simplifie.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'cube',
      build({ int }) {
        const a = int(1, 4);
        return numeric(
          'Calcule cette limite.',
          `lim x → ${a} : (x³ − ${a ** 3}) / (x − ${a})`,
          3 * a * a,
          [
            `x³ − ${a ** 3} = (x − ${a})(${formatPolynomial([a * a, a, 1])}).`,
            `Pour x ≠ ${a}, il reste ${formatPolynomial([a * a, a, 1])}, qui tend vers ${a * a} + ${a * a} + ${a * a} = ${3 * a * a}.`,
          ],
          {
            mistakes: [
              {
                value: 0,
                message:
                  'Remplacer x directement donne 0/0, et 0/0 n’est pas égal à 0 ! Simplifie d’abord, puis regarde de quoi tu t’approches.',
              },
              {
                value: a * a,
                message: `Après simplification, il reste trois termes : x² + ${a}x + ${a * a}. Remplace x dans chacun.`,
              },
            ],
          },
        );
      },
    },
  ],
  rational_limit: [
    {
      id: 'meme-degre',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Calcule la limite en +∞.',
          `(${a}x² + ${c}) / (${b}x² + 1)`,
          a / b,
          [
            'Quand x devient énorme, les nombres seuls ne pèsent presque plus rien à côté des x².',
            `Il reste en gros ${a}x² ÷ ${b}x², donc ${a}/${b}.`,
          ],
          ratio,
        );
      },
    },
    {
      id: 'comparer-les-degres',
      build(tools) {
        const a = tools.int(2, 9),
          b = tools.int(2, 9),
          c = tools.int(1, 6),
          degree = tools.int(1, 3);
        const results = { 1: '0', 2: `${a}/${b}`, 3: '+∞' } as Record<number, string>;
        const correct = results[degree];
        const reason = `Compare les termes de plus haut degré : ${formatPolynomial([0, ...Array(degree - 1).fill(0), a])} au numérateur et ${b}x² au dénominateur.`;
        return choice(
          tools,
          'Quelle est la limite en +∞ ?',
          `(${formatPolynomial([c, ...Array(degree - 1).fill(0), a])}) / (${b}x² + 1)`,
          correct,
          ['0', `${a}/${b}`, '+∞', '−∞'].filter(label => label !== correct).map(value => ({ value, message: reason })),
          [
            reason,
            degree === 1
              ? 'Le dénominateur a le plus haut degré : la limite vaut 0.'
              : degree === 2
                ? `Même degré : la limite est le quotient des coefficients, ${a}/${b}.`
                : 'Le numérateur a le plus haut degré, avec des coefficients positifs : la limite vaut +∞.',
          ],
        );
      },
    },
    {
      id: 'degre-trois',
      build({ int, nonZero }) {
        const p = nonZero(-9, 9),
          q = int(2, 9),
          c = int(1, 6);
        return numeric(
          'Calcule la limite en +∞.',
          `(${formatPolynomial([0, c, 0, p])}) / (${formatPolynomial([-(c + 3), 0, 0, q])})`,
          p / q,
          [
            'Numérateur et dénominateur ont le même degré, 3 : divise-les par x³.',
            `Quand x devient énorme, seuls les x³ comptent. Il reste ${p}/${q}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: q / p,
                message: 'Tu as inversé le quotient : coefficient du numérateur divisé par celui du dénominateur.',
              },
            ],
          },
        );
      },
    },
  ],
  derivative: [
    {
      id: 'puissance',
      build({ int }) {
        const a = int(2, 9),
          exponent = int(2, 4),
          x = int(-3, 4);
        return numeric(
          `Calcule f′(${x}).`,
          `f(x) = ${a}${power('x', exponent)}`,
          a * exponent * x ** (exponent - 1),
          [
            `f′(x) = ${formatPolynomial([...Array(exponent - 1).fill(0), a * exponent])}.`,
            `Remplace x par ${x} : f′(${x}) = ${a * exponent * x ** (exponent - 1)}.`,
          ],
          {
            mistakes: [
              { value: a * x ** exponent, message: 'Tu as calculé la valeur de la fonction, pas celle de sa dérivée.' },
            ],
          },
        );
      },
    },
    {
      id: 'fonction-derivee',
      build({ int, nonZero }) {
        const a = nonZero(-5, 5),
          b = int(-6, 6),
          c = int(-9, 9),
          d = nonZero(-9, 9);
        const answer = [c, 2 * b, 3 * a];
        return polynomial(
          'Donne la fonction dérivée f′(x).',
          `f(x) = ${formatPolynomial([d, c, b, a])}`,
          answer,
          [
            'Dérive chaque terme : (axⁿ)′ = n·a·xⁿ⁻¹, et la dérivée d’une constante est 0.',
            `f′(x) = ${formatPolynomial(answer)}.`,
          ],
          {
            hint: 'Écris par exemple 6x² − 4x + 1 (tu peux commencer par « f′(x) = »).',
            mistakes: [
              { value: [c + d, 2 * b, 3 * a], message: `La dérivée d’une constante est nulle : ${d} disparaît.` },
              { value: [c, b, a], message: 'Tu as diminué les exposants sans multiplier par eux : (axⁿ)′ = n·a·xⁿ⁻¹.' },
            ],
          },
        );
      },
    },
    {
      id: 'polynome-en-un-point',
      build({ int, nonZero }) {
        const a = int(1, 5),
          b = int(-6, 6),
          c = int(-9, 9),
          x = nonZero(-3, 3);
        return numeric(
          `Calcule f′(${x}).`,
          `f(x) = ${formatPolynomial([c, b, a])}`,
          2 * a * x + b,
          [`f′(x) = ${formatPolynomial([b, 2 * a])}.`, `f′(${x}) = ${2 * a} × (${x}) ${signed(b)} = ${2 * a * x + b}.`],
          {
            mistakes: [
              { value: a * x * x + b * x + c, message: `Tu as calculé f(${x}). On demande la valeur de la dérivée.` },
            ],
          },
        );
      },
    },
  ],
  tangent: [
    {
      id: 'ordonnee-a-l-origine',
      build({ int }) {
        const a = int(2, 9);
        return numeric(
          'Trouve l’ordonnée à l’origine p de la tangente en x = a.',
          `f(x) = x² ; a = ${a} ; tangente y = mx + p`,
          -a * a,
          [
            `f(${a}) = ${a * a} et f′(${a}) = ${2 * a}.`,
            `y = ${a * a} + ${2 * a}(x − ${a}) = ${2 * a}x − ${a * a}. Donc p = ${-a * a}.`,
          ],
          {
            mistakes: [
              { value: 2 * a, message: 'C’est la pente m de la tangente. On demande son ordonnée à l’origine p.' },
              { value: a * a, message: 'C’est l’ordonnée du point de contact, pas celle de la droite à x = 0.' },
            ],
          },
        );
      },
    },
    {
      id: 'equation',
      build({ int, nonZero }) {
        const a = nonZero(-3, 3),
          b = int(-5, 5),
          x0 = nonZero(-3, 3);
        const value = a * x0 * x0 + b * x0,
          slope = 2 * a * x0 + b,
          answer = [value - slope * x0, slope];
        return polynomial(
          `Donne l’équation de la tangente au point d’abscisse ${x0}.`,
          `f(x) = ${formatPolynomial([0, b, a])}`,
          answer,
          [
            `f(${x0}) = ${value} et f′(x) = ${formatPolynomial([b, 2 * a])}, donc f′(${x0}) = ${slope}.`,
            `y = f′(${x0})(x − (${x0})) + f(${x0}) = ${formatPolynomial(answer)}.`,
          ],
          {
            hint: 'Écris par exemple y = 4x − 3 (tu peux omettre « y = »).',
            mistakes: [
              {
                value: [value, slope],
                message: `Tu as pris f(${x0}) comme ordonnée à l’origine. La tangente passe par (${x0} ; ${value}), pas par (0 ; ${value}).`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'pente',
      build({ nonZero }) {
        const a = nonZero(-4, 4);
        return numeric(
          `Quelle est la pente de la tangente à la courbe au point d’abscisse ${a} ?`,
          'f(x) = x³',
          3 * a * a,
          ['La pente de la tangente est le nombre dérivé : f′(x) = 3x².', `f′(${a}) = 3 × (${a})² = ${3 * a * a}.`],
          {
            mistakes: [
              { value: a ** 3, message: `C’est f(${a}), l’ordonnée du point. La pente est donnée par la dérivée.` },
              { value: 3 * a, message: 'Dérive x³ en 3x², puis élève bien la valeur au carré.' },
            ],
          },
        );
      },
    },
  ],
};
