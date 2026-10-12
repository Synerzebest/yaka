import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Yaka — Les maths, ça s’apprend',
  description: 'Comprendre, s’entraîner et progresser en mathématiques, de la 1re à la 6e secondaire.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr-BE" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
