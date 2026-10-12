export const studentNavigation = [
  { href: '/dashboard', name: 'Mon tableau de bord', icon: 'grid' },
  { href: '/cours', name: 'Mes cours', icon: 'book' },
  { href: '/exercices', name: 'Exercices', icon: 'infinity' },
  { href: '/progression', name: 'Ma progression', icon: 'chart' },
  { href: '/badges', name: 'Mes badges', icon: 'award' },
];
export function isStudentPath(path: string) {
  return studentNavigation.some(item => path === item.href || path.startsWith(`${item.href}/`));
}
export function safeDestination(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value))
    return '/dashboard';
  try {
    const url = new URL(value, 'https://yaka.invalid');
    if (url.origin !== 'https://yaka.invalid' || !(isStudentPath(url.pathname) || url.pathname === '/compte'))
      return '/dashboard';
    return url.pathname + url.search;
  } catch {
    return '/dashboard';
  }
}
export function lessonHref(slug: string, tab = 'theorie') {
  return `/cours/${encodeURIComponent(slug)}${tab === 'theorie' ? '' : `?onglet=${tab === 'analogie' ? 'analogie' : 'exercices'}`}`;
}
