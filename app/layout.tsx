import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ginekoloģijas ārsta prakses pacienta apmierinātības anketa',
  description:
    'Pacienta apmierinātības anketa ginekoloģijas praksei (prenatālais atbalsts, ginekoloģija, USG).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lv">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="mx-auto max-w-3xl p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Ginekoloģijas ārsta prakses pacienta apmierinātības anketa
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Paldies, ka veltat laiku mūsu prakses novērtēšanai! Jūsu atbildes palīdzēs mums uzlabot
              pakalpojumus. Aizpildīšana aizņems 2–3 minūtes.
            </p>
          </header>
          <main>{children}</main>
          <footer className="mt-12 text-xs text-gray-500 border-t pt-6">
            <p>AB Prakse • Izveidots ar Next.js, TypeScript un Tailwind CSS</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
