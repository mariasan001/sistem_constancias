// src/app/layout.tsx
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Poppins } from 'next/font/google';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Constancias | Inicio de sesión',
  description: 'Acceso al sistema de constancias',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300','400','500','600','700','800','900'],
  display: 'swap',
  variable: '--font-body',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={poppins.variable}>
      <body className="app-body">
        <Toaster richColors closeButton position="top-right" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
