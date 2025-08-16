import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "AIBuddies",
  description: "Content tools, credits, and payments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="container py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
