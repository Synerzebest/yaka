/**
 * Consecutive practice days ending today, or yesterday (the streak is not lost before the day is over).
 * `days` are distinct YYYY-MM-DD dates in Brussels time, as returned by get_my_learning_progress.
 */
export function currentStreak(days: string[], today: string) {
  const practiced = new Set(days);
  const step = (day: string, offset: number) => {
    const date = new Date(`${day}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  let cursor = practiced.has(today) ? today : step(today, -1);
  let streak = 0;
  while (practiced.has(cursor)) {
    streak++;
    cursor = step(cursor, -1);
  }
  return streak;
}
