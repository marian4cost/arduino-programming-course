import './globals.css';

export const metadata = {
  title: 'Arduino Lab | Laboratório de Arduino',
  description: 'Experimentos interativos com Arduino Uno e sketches comentados para usar em aula.',
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
