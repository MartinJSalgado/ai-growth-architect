import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Growth Architect",
  description: "Get intelligent recommendations and strategic guidance for your GTM initiatives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
