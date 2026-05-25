import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChronosRPG — The Git-Native AI Dungeon Master",
  description: "An immersive text-adventure RPG where the game world lives in Git. Time travel with commits, branch alternate realities, and face a Dark Fantasy Cyberpunk world narrated by AI.",
  keywords: ["RPG", "AI", "Dungeon Master", "Git", "Time Travel", "Text Adventure"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
