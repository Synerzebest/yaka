import { choice, numeric, type VariantMap } from './build.ts';
import { number } from './format.ts';

// 1re secondaire : nombres relatifs, priorités, fractions, pourcentages, périmètres, angles.
export const yearOne: VariantMap<
  'integers' | 'order_operations' | 'equivalent_fractions' | 'percentage' | 'perimeter' | 'triangle_angles'
> = {
  integers: [
    {
      id: 'addition',
      build({ int }) {
        const start = -int(2, 20),
          move = int(1, 30);
        return numeric(
          'Effectue cette addition de nombres relatifs.',
          `${start} + ${move} = ?`,
          start + move,
          [`Pars de ${start} sur la droite des nombres.`, `Avance de ${move} unités : tu arrives à ${start + move}.`],
          {
            mistakes: [
              {
                value: Math.abs(start) + move,
                message: 'Tu as additionné les distances à zéro en oubliant le signe négatif du point de départ.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'soustraction',
      build({ int }) {
        const start = int(1, 9),
          back = start + int(1, 12);
        return numeric(
          'Effectue cette soustraction.',
          `${start} − ${back} = ?`,
          start - back,
          [
            `Pars de ${start} et recule de ${back} unités sur la droite des nombres.`,
            `Tu dépasses zéro de ${back - start} unités : ${start} − ${back} = ${start - back}.`,
          ],
          {
            mistakes: [
              {
                value: back - start,
                message: 'Tu recules de plus que ton point de départ : tu passes sous zéro, le résultat est négatif.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'comparaison',
      build(tools) {
        const far = tools.int(5, 12),
          near = tools.int(1, far - 1);
        return choice(
          tools,
          'Quel est le plus petit de ces nombres ?',
          tools.shuffle([-far, -near, near, far]).join(' ; '),
          String(-far),
          [
            { value: String(-near), message: `${-near} est plus proche de zéro que ${-far} : il est donc plus grand.` },
            { value: String(near), message: 'Un nombre positif est toujours plus grand qu’un nombre négatif.' },
            {
              value: String(far),
              message: 'Tu as choisi le nombre le plus éloigné de zéro, mais il est positif : c’est le plus grand.',
            },
          ],
          [
            'Sur la droite des nombres, le plus petit nombre est le plus à gauche.',
            `Parmi les négatifs, ${-far} est le plus éloigné de zéro : il est le plus à gauche.`,
          ],
        );
      },
    },
  ],
  order_operations: [
    {
      id: 'multiplication',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Calcule en respectant les priorités.',
          `${a} + ${b} × ${c} = ?`,
          a + b * c,
          [
            `La multiplication passe avant l’addition : ${b} × ${c} = ${b * c}.`,
            `Ajoute ensuite ${a} : résultat ${a + b * c}.`,
          ],
          {
            mistakes: [
              {
                value: (a + b) * c,
                message:
                  'Tu as effectué l’addition en premier. Il n’y a pas de parenthèses : commence par la multiplication.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'parentheses',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Calcule en respectant les priorités.',
          `(${a} + ${b}) × ${c} = ?`,
          (a + b) * c,
          [
            `Les parenthèses passent en premier : ${a} + ${b} = ${a + b}.`,
            `Multiplie ensuite : ${a + b} × ${c} = ${(a + b) * c}.`,
          ],
          {
            mistakes: [
              {
                value: a + b * c,
                message: 'Les parenthèses changent l’ordre : calcule d’abord ce qu’elles contiennent.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'division',
      build({ int }) {
        const divisor = int(2, 6),
          quotient = int(2, 9),
          start = quotient + int(1, 9);
        return numeric(
          'Calcule en respectant les priorités.',
          `${start} − ${divisor * quotient} : ${divisor} = ?`,
          start - quotient,
          [
            `La division passe avant la soustraction : ${divisor * quotient} : ${divisor} = ${quotient}.`,
            `Soustrais ensuite : ${start} − ${quotient} = ${start - quotient}.`,
          ],
          {
            mistakes: [
              {
                value: (start - divisor * quotient) / divisor,
                message: 'Tu as soustrait en premier. La division est prioritaire sur la soustraction.',
              },
            ],
          },
        );
      },
    },
  ],
  equivalent_fractions: [
    {
      id: 'numerateur',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Trouve le numérateur manquant.',
          `${a}/${b} = ?/${b * c}`,
          a * c,
          [`Le dénominateur est multiplié par ${c}.`, `Multiplie aussi le numérateur : ${a} × ${c} = ${a * c}.`],
          {
            hint: 'Saisis uniquement le numérateur.',
            mistakes: [{ value: a, message: 'Le numérateur doit changer du même facteur que le dénominateur.' }],
          },
        );
      },
    },
    {
      id: 'denominateur',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Trouve le dénominateur manquant.',
          `${a}/${b} = ${a * c}/?`,
          b * c,
          [
            `Le numérateur est multiplié par ${c} : ${a} × ${c} = ${a * c}.`,
            `Multiplie aussi le dénominateur : ${b} × ${c} = ${b * c}.`,
          ],
          {
            hint: 'Saisis uniquement le dénominateur.',
            mistakes: [
              {
                value: b + a * c - a,
                message:
                  'Tu as ajouté le même nombre en haut et en bas. Pour garder une fraction égale, il faut multiplier.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'simplifier',
      build(tools) {
        const [a, b] = tools.pick([
          [1, 2],
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
          [4, 5],
          [5, 6],
          [3, 7],
          [5, 8],
          [7, 9],
        ] as const);
        const k = tools.int(2, 6);
        return choice(
          tools,
          'Quelle fraction est égale à celle-ci, simplifiée au maximum ?',
          `${a * k}/${b * k}`,
          `${a}/${b}`,
          [
            {
              value: `${a * k - k + 1}/${b * k - k + 1}`,
              message: 'Retirer le même nombre en haut et en bas change la fraction. Simplifier, c’est diviser.',
            },
            { value: `${b}/${a}`, message: 'Tu as inversé le numérateur et le dénominateur.' },
            {
              value: `${a}/${b * k}`,
              message: 'Tu n’as divisé que le numérateur. Divise les deux par le même nombre.',
            },
          ],
          [
            `${a * k} et ${b * k} sont tous les deux divisibles par ${k}.`,
            `${a * k} : ${k} = ${a} et ${b * k} : ${k} = ${b}. ${a} et ${b} n’ont plus de diviseur commun.`,
          ],
        );
      },
    },
  ],
  percentage: [
    {
      id: 'reduction',
      build({ int }) {
        const total = int(2, 9) * 20,
          percent = int(2, 9) * 5;
        return numeric(
          'Calcule le montant de la réduction.',
          `${percent} % de ${total} €`,
          (total * percent) / 100,
          [
            `${percent} % signifie ${percent}/100.`,
            `${total} × ${percent}/100 = ${number((total * percent) / 100)} €.`,
          ],
          {
            unit: '€',
            mistakes: [
              {
                value: (total * (100 - percent)) / 100,
                message: 'Tu as donné le prix restant. On demande le montant de la réduction.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'prix-final',
      build({ int }) {
        const total = int(2, 9) * 20,
          percent = int(2, 9) * 5;
        return numeric(
          'Calcule le prix après la réduction.',
          `${total} € avec une réduction de ${percent} %`,
          (total * (100 - percent)) / 100,
          [
            `La réduction vaut ${total} × ${percent}/100 = ${number((total * percent) / 100)} €.`,
            `Prix final : ${total} − ${number((total * percent) / 100)} = ${number((total * (100 - percent)) / 100)} €.`,
          ],
          {
            unit: '€',
            mistakes: [
              {
                value: (total * percent) / 100,
                message: 'C’est le montant de la réduction. Il faut encore le retirer du prix de départ.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'quel-pourcentage',
      build({ int }) {
        const total = int(2, 9) * 20,
          percent = int(2, 9) * 5,
          part = (total * percent) / 100;
        return numeric(
          'Quel pourcentage du prix représente la réduction ?',
          `Réduction de ${number(part)} € sur ${total} €`,
          percent,
          [
            `La réduction représente ${number(part)}/${total} du prix.`,
            `En pourcentage : ${number(part)}/${total} × 100 = ${percent} %.`,
          ],
          {
            unit: '%',
            hint: 'Saisis le pourcentage sans le symbole %.',
            mistakes: [
              {
                value: part / total,
                message: 'Tu as trouvé la part décimale. Multiplie-la par 100 pour l’écrire en pourcentage.',
              },
            ],
          },
        );
      },
    },
  ],
  perimeter: [
    {
      id: 'rectangle',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Calcule le périmètre du rectangle.',
          `L = ${a} m ; l = ${b} m`,
          2 * (a + b),
          [
            `Additionne les deux dimensions : ${a} + ${b} = ${a + b}.`,
            `Compte les deux paires de côtés : 2 × ${a + b} = ${2 * (a + b)} m.`,
          ],
          {
            unit: 'm',
            mistakes: [
              { value: a * b, message: 'Tu as calculé l’aire. Pour le périmètre, additionne les quatre côtés.' },
            ],
          },
        );
      },
    },
    {
      id: 'largeur',
      build({ int }) {
        const length = int(4, 12),
          width = int(1, length - 1),
          perimeter = 2 * (length + width);
        return numeric(
          'Trouve la largeur du rectangle.',
          `Périmètre : ${perimeter} m ; longueur : ${length} m`,
          width,
          [
            `Une longueur et une largeur forment la moitié du contour : ${perimeter} : 2 = ${perimeter / 2} m.`,
            `Retire la longueur : ${perimeter / 2} − ${length} = ${width} m.`,
          ],
          {
            unit: 'm',
            mistakes: [
              {
                value: perimeter - length,
                message:
                  'Le contour contient deux longueurs et deux largeurs : commence par diviser le périmètre par 2.',
              },
              {
                value: perimeter / 2,
                message: 'C’est la somme d’une longueur et d’une largeur. Retire encore la longueur.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'carre',
      build({ int }) {
        const side = int(2, 15);
        return numeric(
          'Trouve la longueur du côté de ce carré.',
          `Périmètre du carré : ${4 * side} cm`,
          side,
          ['Un carré a quatre côtés de même longueur.', `Côté : ${4 * side} : 4 = ${side} cm.`],
          {
            unit: 'cm',
            mistakes: [{ value: 2 * side, message: 'Un carré a quatre côtés : divise le périmètre par 4, pas par 2.' }],
          },
        );
      },
    },
  ],
  triangle_angles: [
    {
      id: 'troisieme-angle',
      build({ int }) {
        const first = int(2, 9) * 5,
          second = int(2, 9) * 5;
        return numeric(
          'Trouve le troisième angle intérieur.',
          `α = ${first}° ; β = ${second}° ; γ = ?`,
          180 - first - second,
          [
            'Les trois angles du triangle totalisent 180°.',
            `γ = 180 − ${first} − ${second} = ${180 - first - second}°.`,
          ],
          {
            unit: '°',
            mistakes: [
              { value: 360 - first - second, message: 'La somme des angles d’un triangle est 180°, pas 360°.' },
            ],
          },
        );
      },
    },
    {
      id: 'isocele',
      build({ int }) {
        const apex = int(2, 16) * 10;
        return numeric(
          'Ce triangle est isocèle. Trouve la mesure d’un angle à la base.',
          `Angle au sommet : ${apex}°`,
          (180 - apex) / 2,
          [
            `Les deux angles à la base se partagent 180 − ${apex} = ${180 - apex}°.`,
            `Ils sont égaux : ${180 - apex} : 2 = ${(180 - apex) / 2}°.`,
          ],
          {
            unit: '°',
            mistakes: [
              { value: 180 - apex, message: 'Ces degrés se partagent entre les deux angles à la base : divise par 2.' },
            ],
          },
        );
      },
    },
    {
      id: 'rectangle',
      build({ int }) {
        const acute = int(3, 15) * 5;
        return numeric(
          'Ce triangle est rectangle. Trouve le troisième angle.',
          `Angle droit ; α = ${acute}° ; β = ?`,
          90 - acute,
          [
            `L’angle droit mesure déjà 90° : il reste 180 − 90 = 90° pour les deux autres.`,
            `β = 90 − ${acute} = ${90 - acute}°.`,
          ],
          {
            unit: '°',
            mistakes: [
              { value: 180 - acute, message: 'N’oublie pas l’angle droit : il compte déjà 90° dans la somme.' },
            ],
          },
        );
      },
    },
  ],
};
