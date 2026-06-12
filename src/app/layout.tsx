import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chevy Chase Scramble",
  description: "Public results, private score entry, contest tracking, and admin tools for the Chevy Chase Scramble.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
