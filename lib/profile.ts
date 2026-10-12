export type Profile = { id: string; display_name: string; school_year: number; exercise_goal: number };
export function validateProfile(input: { display_name: unknown; school_year: unknown; exercise_goal: unknown }) {
  const display_name = typeof input.display_name === 'string' ? input.display_name.trim() : '';
  const school_year = Number(input.school_year);
  const exercise_goal = Number(input.exercise_goal);
  if (!display_name || display_name.length > 80) return { error: 'Choisis un prénom de 1 à 80 caractères.' } as const;
  if (!Number.isInteger(school_year) || school_year < 1 || school_year > 6)
    return { error: 'Choisis une année de la 1re à la 6e secondaire.' } as const;
  if (![3, 5, 10].includes(exercise_goal)) return { error: 'Choisis un objectif de 3, 5 ou 10 exercices.' } as const;
  return { data: { display_name, school_year, exercise_goal } } as const;
}
