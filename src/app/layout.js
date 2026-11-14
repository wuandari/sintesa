import './globals.css';
import { getLang } from '@/lib/lang.js';
import { LangProvider } from '@/i18n/client.jsx';

export const metadata = {
  title: 'Sintesa — Pembelajaran 3D & AR',
  description: 'Platform pembelajaran interaktif dengan materi 3D dan Augmented Reality untuk Kelas 10 SMK RPL.',
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1f78d9' };

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><LangProvider lang={lang}>{children}</LangProvider></body>
    </html>
  );
}
