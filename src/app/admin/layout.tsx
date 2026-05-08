import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | SABOR RAIZ",
  description: "Painel administrativo do Sabor Raiz",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
