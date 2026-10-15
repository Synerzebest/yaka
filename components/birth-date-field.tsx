'use client';

import { useState } from 'react';
import { ageOn, consentAge, todayInBrussels } from '@/lib/age';
import { Select, type SelectOption } from './select';

const months = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];
const monthOptions: SelectOption[] = months.map((label, index) => ({ value: String(index + 1), label }));

function daysIn(month: number, year: number) {
  // Day 0 of the next month is the last day of this one. Without a year yet, allow 29 February.
  return new Date(Date.UTC(year || 2000, month, 0)).getUTCDate();
}

/**
 * Day / month / year with three Yaka selects instead of the native date picker, which on phones
 * opens on today's date and makes a 12-year-old scroll back twelve years.
 * The YYYY-MM-DD value is submitted through a hidden input, as before.
 */
export function BirthDateField({
  labelId,
  name = 'birth_date',
  disabled = false,
}: {
  labelId: string;
  name?: string;
  disabled?: boolean;
}) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const today = todayInBrussels();
  const currentYear = Number(today.slice(0, 4));

  // Most likely years first: the secondary school age range sits at the top of the list.
  const yearOptions: SelectOption[] = Array.from({ length: currentYear - 6 - 1920 + 1 }, (_, index) => {
    const value = String(currentYear - 6 - index);
    return { value, label: value };
  });
  const maxDay = month ? daysIn(Number(month), Number(year)) : 31;
  const dayOptions: SelectOption[] = Array.from({ length: maxDay }, (_, index) => ({
    value: String(index + 1),
    label: index === 0 ? '1er' : String(index + 1),
  }));

  // Keep the day valid when the month or the year changes (31 April becomes 30 April).
  function fixDay(nextMonth: string, nextYear: string) {
    if (day && nextMonth && Number(day) > daysIn(Number(nextMonth), Number(nextYear)))
      setDay(String(daysIn(Number(nextMonth), Number(nextYear))));
  }

  const value = day && month && year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';
  const age = value ? ageOn(value, today) : null;

  return (
    <div className="birth-date" role="group" aria-labelledby={labelId}>
      <input type="hidden" name={name} value={value} />
      <div className="birth-date-selects">
        <Select
          label="Jour de naissance"
          placeholder="Jour"
          options={dayOptions}
          value={day}
          onChange={setDay}
          disabled={disabled}
        />
        <Select
          label="Mois de naissance"
          placeholder="Mois"
          options={monthOptions}
          value={month}
          onChange={next => {
            setMonth(next);
            fixDay(next, year);
          }}
          disabled={disabled}
        />
        <Select
          label="Année de naissance"
          placeholder="Année"
          options={yearOptions}
          value={year}
          onChange={next => {
            setYear(next);
            fixDay(month, next);
          }}
          disabled={disabled}
        />
      </div>
      {/* Empty until the date is complete: the field stays compact, and the reaction is announced. */}
      <p className={`birth-date-note ${age === null ? '' : age < consentAge ? 'parent' : 'ok'}`} aria-live="polite">
        {age === null
          ? ''
          : age < consentAge
            ? `🎂 ${age} ans ! Ton parent devra dire oui à ton compte : on t’explique tout juste après.`
            : `🎂 ${age} ans, c’est noté !`}
      </p>
    </div>
  );
}
