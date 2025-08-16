import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "AIBuddies",
  description: "Create, repurpose, and scale your content with AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-white antialiased">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
