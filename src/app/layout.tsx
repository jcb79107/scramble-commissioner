import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scramble",
  description: "Public results, private score entry, contest tracking, and admin tools for Scramble.",
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Scramble",
  },
  icons: {
    icon: [
      {
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },
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
