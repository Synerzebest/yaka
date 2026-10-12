// Display helpers shared by every exercise template. They only produce text.

export function number(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6))).replace('.', ',');
}

/** "+ 3" or "− 3", to write a term after another one. */
export function signed(value: number) {
  return value < 0 ? `− ${Math.abs(value)}` : `+ ${value}`;
}

const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const subscripts = '₀₁₂₃₄₅₆₇₈₉';

export function power(base: number | string, exponent: number) {
  return `${base}${String(exponent)
    .split('')
    .map(digit => superscripts[Number(digit)])
    .join('')}`;
}

/** Sequence index: u(3) → "u₃". */
export function term(index: number, name = 'u') {
  return `${name}${String(index)
    .split('')
    .map(digit => subscripts[Number(digit)])
    .join('')}`;
}

export function thousands(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Formats coefficients ordered by increasing degree, e.g. [−2, 0, 3] → "3x² − 2". */
export function formatPolynomial(coefficients: number[], variable = 'x') {
  const parts: string[] = [];
  for (let degree = coefficients.length - 1; degree >= 0; degree--) {
    const coefficient = coefficients[degree];
    if (!coefficient) continue;
    const size = Math.abs(coefficient);
    const letters = degree === 0 ? '' : degree === 1 ? variable : power(variable, degree);
    const body = degree > 0 && size === 1 ? letters : `${number(size)}${letters}`;
    if (!parts.length) parts.push(coefficient < 0 ? `−${body}` : body);
    else parts.push(coefficient < 0 ? `− ${body}` : `+ ${body}`);
  }
  return parts.length ? parts.join(' ') : '0';
}

/** The factor (x − r), written "x" when r = 0. */
export function rootFactor(root: number) {
  return root === 0 ? 'x' : `(x ${signed(-root)})`;
}

/** A number inside a power or a product: negative values get parentheses, (−3)². */
export function wrap(value: number) {
  return value < 0 ? `(${value})` : String(value);
}

/** a(x − h)² + k, written without "+ 0" or "1(". */
export function vertexForm(a: number, h: number, k: number) {
  const factor = a === 1 ? '' : a === -1 ? '−' : String(a);
  const square = h === 0 ? 'x²' : `(x ${signed(-h)})²`;
  return `${factor}${square}${k === 0 ? '' : ` ${signed(k)}`}`;
}

/** kπ written as a student would: π/6, 2π/3, π, 3π/2. */
export function piFraction(numerator: number, denominator: number) {
  const top = numerator === 1 ? 'π' : `${numerator}π`;
  return denominator === 1 ? top : `${top}/${denominator}`;
}
