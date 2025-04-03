// layout.tsx
import type { Metadata, } from "next";
import { Geist, } from "next/font/google";
import "./globals.css";
import { Toaster, } from "@/components/ui/sonner";
import { ItemsProvider, } from "@/providers/items-provider";

const inter = Geist({
  subsets: ["latin",],
  variable: "--font-inter",
},);

export const metadata: Metadata = {
  title: "Amazon Product Tool",
  description: "Manage and export Amazon product data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>,) {
  return (
    <ItemsProvider>
      <html lang="en">
        <body
          className={`${inter.className} antialiased`}
        >
          {children}
          <Toaster
            richColors
            toastOptions={{
              className: inter.className,
            }}
            theme="light"
            position="top-center"
          />
        </body>
      </html>
    </ItemsProvider>
  );
}
