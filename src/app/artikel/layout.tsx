import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function ArtikelLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className={jakartaSans.className}>{children}</div>;
}
