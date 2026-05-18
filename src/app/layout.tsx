import type { Metadata } from "next";
import "./globals.css";
import { SecurityWrapper } from "@/components/security-wrapper";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "SABOR RAIZ | Delivery Artesanal Premium",
  description: "O melhor delivery artesanal da cidade. Hambúrgueres premium, combos especiais e muito mais. Peça agora!",
  keywords: ["delivery", "hamburguer", "artesanal", "sabor raiz", "food"],
};

import { BottomNav } from "@/components/bottom-nav";
import { CartSheet } from "@/components/cart-sheet";
import { CartBar } from "@/components/cart-bar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-gray-50/50">
        <SecurityWrapper>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen pb-20">
              {children}
            </div>
            <CartBar />
            <CartSheet />
            <BottomNav />
          </ThemeProvider>
        </SecurityWrapper>
      </body>
    </html>
  );
}
