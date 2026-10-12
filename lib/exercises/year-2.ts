import { numeric, ratio, type VariantMap } from './build.ts';
import { number, power, thousands } from './format.ts';

// 2e secondaire : fractions, équations, aires, puissances, proportionnalité, moyenne.
export const yearTwo: VariantMap<'fractions' | 'equations' | 'geometry' | 'powers' | 'proportion' | 'mean'> = {
  fractions: [
    {
      id: 'meme-denominateur',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Additionne les deux fractions.',
          `${a}/${c} + ${b}/${c} = ?`,
          (a + b) / c,
          [
            'Les dénominateurs sont identiques : les parts ont la même taille.',
            `Additionne les numérateurs : (${a} + ${b})/${c} = ${a + b}/${c}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: (a + b) / (2 * c),
                message:
                  'Tu as aussi additionné les dénominateurs. La taille des parts ne change pas : garde le dénominateur.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'soustraction',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Soustrais les deux fractions.',
          `${a + b}/${c} − ${a}/${c} = ?`,
          b / c,
          [
            'Les dénominateurs sont identiques : on retire des parts de même taille.',
            `Soustrais les numérateurs : (${a + b} − ${a})/${c} = ${b}/${c}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: b,
                message:
                  'Tu as aussi soustrait les dénominateurs. La taille des parts ne change pas : garde le dénominateur.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'denominateurs-differents',
      build({ int }) {
        const a = int(1, 9),
          b = int(1, 9),
          c = int(2, 6),
          k = int(2, 3),
          common = c * k;
        return numeric(
          'Additionne les deux fractions.',
          `${a}/${c} + ${b}/${common} = ?`,
          (a * k + b) / common,
          [
            `Mets les deux fractions sur le même dénominateur ${common} : ${a}/${c} = ${a * k}/${common}.`,
            `Additionne ensuite les numérateurs : (${a * k} + ${b})/${common} = ${a * k + b}/${common}.`,
          ],
          {
            ...ratio,
            mistakes: [
              {
                value: (a + b) / (c + common),
                message:
                  'On n’additionne pas les dénominateurs : il faut d’abord des parts de même taille, avec un dénominateur commun.',
              },
            ],
          },
        );
      },
    },
  ],
  equations: [
    {
      id: 'addition',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Trouve la valeur de x.',
          `x + ${a} = ${a + b}`,
          b,
          [
            `Quel nombre de départ, augmenté de ${a}, donne ${a + b} ? Les ${a} ajoutés sont déjà compris dans ${a + b}.`,
            `Pour retrouver le départ, retire cet ajout : ${a + b} − ${a} = ${b}. En écriture mathématique, on retire ${a} des deux côtés : x + ${a} − ${a} = ${a + b} − ${a}.`,
            `Essaie ${b} à la place de x : ${b} + ${a} = ${a + b}. Les deux côtés donnent bien le même nombre.`,
          ],
          {
            mistakes: [
              {
                value: 2 * a + b,
                message: `Tu as peut-être ajouté ${a} au total. Mais cet ajout est déjà compris dedans ! Avec ${2 * a + b} au départ, on obtiendrait ${3 * a + b}, au lieu de ${a + b}.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'soustraction',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Trouve la valeur de x.',
          `x − ${a} = ${b}`,
          a + b,
          [
            `Quel nombre, diminué de ${a}, donne ${b} ? Il faut rendre les ${a} retirés.`,
            `Ajoute ${a} des deux côtés : x = ${b} + ${a} = ${a + b}.`,
            `Vérifie : ${a + b} − ${a} = ${b}.`,
          ],
          {
            mistakes: [
              {
                value: b - a,
                message: `Tu as retiré ${a} une deuxième fois. Pour annuler une soustraction, on ajoute.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'multiplication',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Trouve la valeur de x.',
          `${a}x = ${a * b}`,
          b,
          [
            `${a}x signifie ${a} × x : quel nombre, multiplié par ${a}, donne ${a * b} ?`,
            `Divise les deux côtés par ${a} : x = ${a * b} : ${a} = ${b}.`,
          ],
          {
            mistakes: [
              {
                value: a * b - a,
                message: `x est multiplié par ${a}, pas augmenté de ${a} : pour l’isoler, divise par ${a}.`,
              },
            ],
          },
        );
      },
    },
  ],
  geometry: [
    {
      id: 'rectangle',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Calcule l’aire du rectangle.',
          `L = ${a} m ; l = ${b} m`,
          a * b,
          ['L’aire vaut longueur × largeur.', `${a} × ${b} = ${a * b} m².`],
          {
            unit: 'm²',
            mistakes: [
              {
                value: 2 * (a + b),
                message: 'Tu as calculé le périmètre, qui mesure le contour. Une aire mesure la surface.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'triangle',
      build({ int }) {
        const base = 2 * int(1, 8),
          height = int(2, 9);
        return numeric(
          'Calcule l’aire du triangle.',
          `Base : ${base} cm ; hauteur : ${height} cm`,
          (base * height) / 2,
          [
            'Un triangle occupe la moitié du rectangle construit sur sa base et sa hauteur.',
            `Aire = ${base} × ${height} : 2 = ${(base * height) / 2} cm².`,
          ],
          {
            unit: 'cm²',
            mistakes: [
              {
                value: base * height,
                message: 'C’est l’aire du rectangle qui entoure le triangle. Divise encore par 2.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'cote-manquant',
      build({ int }) {
        const length = int(2, 12),
          width = int(2, 9);
        return numeric(
          'Trouve la largeur du rectangle.',
          `Aire : ${length * width} m² ; longueur : ${length} m`,
          width,
          [
            `Aire = longueur × largeur, donc ${length} × l = ${length * width}.`,
            `l = ${length * width} : ${length} = ${width} m.`,
          ],
          {
            unit: 'm',
            mistakes: [
              {
                value: length * width - length,
                message: 'L’aire est un produit : pour retrouver la largeur, divise par la longueur.',
              },
            ],
          },
        );
      },
    },
  ],
  powers: [
    {
      id: 'produit',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Trouve l’exposant manquant.',
          `${power(2, a)} × ${power(2, b)} = 2ⁿ ; n = ?`,
          a + b,
          [
            'Les bases sont identiques et il s’agit d’un produit.',
            `Additionne les exposants : ${a} + ${b} = ${a + b}.`,
          ],
          {
            hint: 'Saisis uniquement l’exposant n.',
            mistakes: [
              {
                value: a * b,
                message: 'Les exposants se multiplient pour une puissance de puissance. Ici, ils s’additionnent.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'quotient',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9);
        return numeric(
          'Trouve l’exposant manquant.',
          `${power(3, a + b)} : ${power(3, b)} = 3ⁿ ; n = ?`,
          a,
          [
            `On retire ${b} facteurs 3 des ${a + b} facteurs du numérateur.`,
            `Soustrais les exposants : ${a + b} − ${b} = ${a}.`,
          ],
          {
            hint: 'Saisis uniquement l’exposant n.',
            mistakes: [
              {
                value: (a + b) / b,
                message: 'Pour un quotient de même base, on soustrait les exposants : on ne les divise pas.',
              },
            ],
          },
        );
      },
    },
    {
      id: 'puissance-de-puissance',
      build({ int }) {
        const a = int(2, 5),
          c = int(2, 4);
        return numeric(
          'Trouve l’exposant manquant.',
          `(${power(5, a)})${power('', c)} = 5ⁿ ; n = ?`,
          a * c,
          [
            `On écrit ${c} fois le facteur ${power(5, a)}.`,
            `Cela fait ${c} × ${a} = ${a * c} facteurs 5 : multiplie les exposants.`,
          ],
          {
            hint: 'Saisis uniquement l’exposant n.',
            mistakes: [{ value: a + c, message: 'Pour une puissance de puissance, les exposants se multiplient.' }],
          },
        );
      },
    },
  ],
  proportion: [
    {
      id: 'prix',
      build({ int }) {
        const count = int(2, 9),
          price = int(2, 9),
          wanted = int(2, 6) + 7;
        return numeric(
          'Au même prix unitaire, combien coûtent les cahiers demandés ?',
          `${count} cahiers : ${count * price} € ; ${wanted} cahiers : ?`,
          price * wanted,
          [
            `Un cahier coûte ${count * price} : ${count} = ${price} €.`,
            `${wanted} cahiers coûtent ${price} × ${wanted} = ${price * wanted} €.`,
          ],
          { unit: '€' },
        );
      },
    },
    {
      id: 'recette',
      build({ int }) {
        const perPerson = 10 * int(5, 15),
          people = int(2, 5),
          wanted = people + int(1, 4);
        return numeric(
          'La recette reste proportionnelle. Quelle quantité de farine faut-il ?',
          `${people} personnes : ${perPerson * people} g ; ${wanted} personnes : ?`,
          perPerson * wanted,
          [
            `Pour une personne : ${perPerson * people} : ${people} = ${perPerson} g.`,
            `Pour ${wanted} personnes : ${perPerson} × ${wanted} = ${perPerson * wanted} g.`,
          ],
          {
            unit: 'g',
            mistakes: [
              {
                value: perPerson * people + wanted - people,
                message: `Ajouter ${wanted - people} personnes n’ajoute pas ${wanted - people} grammes : passe par la quantité pour une personne.`,
              },
            ],
          },
        );
      },
    },
    {
      id: 'echelle',
      build({ int, pick }) {
        const scale = pick([25000, 50000, 100000, 200000]),
          map = int(2, 12);
        return numeric(
          'Quelle distance réelle, en kilomètres, représente ce trajet sur la carte ?',
          `Échelle 1/${thousands(scale)} ; ${map} cm sur la carte`,
          (map * scale) / 100000,
          [
            `1 cm sur la carte représente ${thousands(scale)} cm en réalité, soit ${number(scale / 100000)} km.`,
            `${map} cm représentent ${map} × ${number(scale / 100000)} = ${number((map * scale) / 100000)} km.`,
          ],
          {
            unit: 'km',
            mistakes: [
              {
                value: map * scale,
                message: 'Tu as trouvé la distance en centimètres. Convertis-la en kilomètres : 1 km = 100 000 cm.',
              },
            ],
          },
        );
      },
    },
  ],
  mean: [
    {
      id: 'moyenne',
      build({ int }) {
        const a = int(2, 9),
          b = int(2, 9),
          c = int(2, 6);
        return numeric(
          'Calcule la moyenne des trois valeurs.',
          `${a}, ${b}, ${c}`,
          (a + b + c) / 3,
          [`La somme vaut ${a} + ${b} + ${c} = ${a + b + c}.`, `Il y a 3 valeurs : moyenne = ${a + b + c}/3.`],
          {
            ...ratio,
            mistakes: [
              { value: a + b + c, message: 'Tu as trouvé la somme. Il reste à diviser par le nombre de valeurs.' },
            ],
          },
        );
      },
    },
    {
      id: 'valeur-manquante',
      build({ int }) {
        const known = [int(5, 15), int(5, 15), int(5, 15)],
          missing = int(5, 15);
        const sum = known[0] + known[1] + known[2],
          total = sum + missing;
        return numeric(
          'Trouve la quatrième note.',
          `Moyenne des 4 notes : ${number(total / 4)} ; trois notes : ${known.join(', ')}`,
          missing,
          [
            `La somme des 4 notes vaut 4 × ${number(total / 4)} = ${total}.`,
            `La quatrième note vaut ${total} − ${sum} = ${missing}.`,
          ],
          {
            mistakes: [
              { value: total, message: 'C’est la somme des quatre notes. Retire encore les trois notes connues.' },
            ],
          },
        );
      },
    },
    {
      id: 'mediane',
      build({ int, shuffle }) {
        const sorted = [int(2, 9)];
        for (let index = 1; index < 5; index++) sorted.push(sorted[index - 1] + int(1, 4));
        const shown = shuffle(sorted),
          median = sorted[2];
        return numeric(
          'Quelle est la médiane de ces cinq valeurs ?',
          shown.join(', '),
          median,
          [
            `Range les valeurs dans l’ordre croissant : ${sorted.join(', ')}.`,
            `Il y a 5 valeurs : la médiane est la 3e, ${median}.`,
          ],
          {
            mistakes: [
              {
                value: shown[2],
                message: 'Tu as pris la valeur du milieu sans ranger la liste. Commence par l’ordre croissant.',
              },
              {
                value: sorted.reduce((sum, value) => sum + value, 0) / 5,
                message: 'C’est la moyenne. La médiane est la valeur du milieu de la liste rangée.',
              },
            ],
          },
        );
      },
    },
  ],
};
