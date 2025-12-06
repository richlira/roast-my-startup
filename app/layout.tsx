import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roast My Startup 🔥",
  description: "3 AI VCs will destroy your pitch deck. Feedback disfrazado de roast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-900 text-white antialiased">
        <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fire-900/20 via-transparent to-transparent -z-10" />
        {children}
      </body>
    </html>
  );
}
