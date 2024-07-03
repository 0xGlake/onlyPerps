import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from './components/Header';
import StaleDataCountdownFooter from './components/StaleDataCountdownFooter';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnlyPerps",
  description: "Perps Dex Dashboard with open interest and funding rate data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
        <StaleDataCountdownFooter />
      </body>
    </html>
  );
}
