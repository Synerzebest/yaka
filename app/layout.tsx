import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';

// Nunito: rounded and very readable for long explanations. Fredoka: friendly headings.
const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Yaka — Les maths, ça s’apprend',
  description: 'Comprendre, s’entraîner et progresser en mathématiques, de la 1re à la 6e secondaire.',
};

export const viewport: Viewport = { themeColor: '#12a36d' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr-BE" className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
