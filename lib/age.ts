// Belgian threshold for a child's own consent to an online service (GDPR art. 8, Belgian law of 30 July 2018).
// The database applies the same rule in private.access_status: this copy only drives the forms.
export const consentAge = 13;

/** Today's date in Brussels, as YYYY-MM-DD, whatever the server time zone. */
export function todayInBrussels(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Brussels',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Completed years between two YYYY-MM-DD dates. */
export function ageOn(birthDate: string, day: string) {
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
  const [year, month, date] = day.split('-').map(Number);
  const beforeBirthday = month < birthMonth || (month === birthMonth && date < birthDay);
  return year - birthYear - (beforeBirthday ? 1 : 0);
}

export function validateBirthDate(input: unknown, today = todayInBrussels()) {
  const value = typeof input === 'string' ? input.trim() : '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const parsed = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
  // Rejects impossible dates such as 2014-02-30, which Date silently moves to March.
  if (!match || !parsed || parsed.toISOString().slice(0, 10) !== value)
    return { error: 'Indique une date de naissance valide.' } as const;
  if (value < '1900-01-01' || ageOn(value, today) < 6) return { error: 'Vérifie ta date de naissance.' } as const;
  return { data: value, needsParentalConsent: ageOn(value, today) < consentAge } as const;
}

export function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
