'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from './icons';

export type SelectOption = { value: string; label: string; hint?: string };

/** The six school years, shared by the dashboard and the account form. */
export const schoolYearOptions: SelectOption[] = [
  { value: '1', label: '1re secondaire', hint: 'Des bases solides' },
  { value: '2', label: '2e secondaire', hint: 'Prendre confiance' },
  { value: '3', label: '3e secondaire', hint: 'Tout relier' },
  { value: '4', label: '4e secondaire', hint: 'La vitesse supérieure' },
  { value: '5', label: '5e secondaire', hint: 'Maths 6 h' },
  { value: '6', label: '6e secondaire', hint: 'Maths 6 h, la dernière ligne droite' },
];

type Props = {
  options: SelectOption[];
  /** Controlled value. Leave undefined and use defaultValue for an uncontrolled field. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Submitted with the surrounding form through a hidden input. */
  name?: string;
  /** Accessible name: the id of a visible label, or a plain label. */
  labelledBy?: string;
  label?: string;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  /** Shown while no option is chosen. Without it, the first option is selected by default. */
  placeholder?: string;
};

/**
 * Yaka's select, following the WAI-ARIA "select-only combobox" pattern:
 * a button with role="combobox" controls a listbox. Keyboard: arrows, Home/End, Enter/Space,
 * Escape, Tab, and typing the first letters of an option.
 */
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  name,
  labelledBy,
  label,
  disabled = false,
  icon,
  className = '',
  placeholder,
}: Props) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue ?? (placeholder ? '' : (options[0]?.value ?? '')));
  const selected = value ?? internal;
  const found = options.findIndex(option => option.value === selected);
  // With a placeholder and no value yet, nothing is selected; keyboard navigation starts at the top.
  const selectedIndex = Math.max(0, found);
  const empty = found < 0 && !!placeholder;
  const [open, setOpen] = useState(false);
  // The list stays on screen while its closing animation plays; `open` alone drives the ARIA state.
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [upward, setUpward] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: '', at: 0 });

  // Close when clicking or tapping outside.
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  // Fallback in case the closing animation never ends (for instance in a background tab).
  useEffect(() => {
    if (open || !visible) return;
    const timer = window.setTimeout(() => setVisible(false), 300);
    return () => window.clearTimeout(timer);
  }, [open, visible]);

  // Keep the active option visible while navigating with the keyboard.
  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);

  function show() {
    if (disabled) return;
    // Open upwards when there is not enough room below (for instance near the bottom of a phone screen).
    const box = button.current?.getBoundingClientRect();
    if (box)
      setUpward(
        window.innerHeight - box.bottom < Math.min(320, options.length * 56 + 24) &&
          box.top > window.innerHeight - box.bottom,
      );
    setActive(selectedIndex);
    setOpen(true);
    setVisible(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    if (value === undefined) setInternal(option.value);
    if (option.value !== selected) onChange?.(option.value);
    setOpen(false);
    button.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    const last = options.length - 1;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!open) return show();
        setActive(index => Math.min(last, Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1))));
        return;
      case 'Home':
      case 'End':
        if (!open) return;
        event.preventDefault();
        setActive(event.key === 'Home' ? 0 : last);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) choose(active);
        else show();
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        return;
      case 'Tab':
        if (open) choose(active);
        return;
      default:
        // Type-ahead: jump to the first option starting with the typed letters.
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const now = Date.now();
          typed.current = {
            text: (now - typed.current.at < 700 ? typed.current.text : '') + event.key.toLowerCase(),
            at: now,
          };
          const match = options.findIndex(option => option.label.toLowerCase().startsWith(typed.current.text));
          if (match >= 0) {
            if (open) setActive(match);
            else choose(match);
          }
        }
    }
  }

  const current = empty ? undefined : options[selectedIndex];
  return (
    <div ref={root} className={`yaka-select ${open ? 'open' : ''} ${upward ? 'upward' : ''} ${className}`}>
      {name && <input type="hidden" name={name} value={selected} />}
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}-value` : undefined}
        aria-label={labelledBy ? undefined : label}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        disabled={disabled}
        className="yaka-select-button"
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        {icon && <span className="yaka-select-icon">{icon}</span>}
        <span className={`yaka-select-value ${empty ? 'placeholder' : ''}`} id={`${id}-value`}>
          {current?.label ?? placeholder}
        </span>
        <Icon name="chevron" size={16} className="yaka-select-chevron" />
      </button>
      <ul
        id={`${id}-listbox`}
        role="listbox"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        tabIndex={-1}
        hidden={!visible}
        className={`yaka-select-list ${!open && visible ? 'closing' : ''}`}
        onAnimationEnd={event => {
          // Ignore animations bubbling from inside the list (the check mark pops too).
          if (event.target === event.currentTarget && !open) setVisible(false);
        }}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${id}-option-${index}`}
            role="option"
            aria-selected={option.value === selected}
            className={index === active ? 'active' : ''}
            onPointerEnter={() => setActive(index)}
            // pointerdown + preventDefault keeps the focus on the button, as the pattern requires.
            onPointerDown={event => event.preventDefault()}
            onClick={() => choose(index)}
          >
            <span>
              <strong>{option.label}</strong>
              {option.hint && <small>{option.hint}</small>}
            </span>
            {option.value === selected && <Icon name="check" size={18} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
