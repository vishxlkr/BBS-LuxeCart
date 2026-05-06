import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "LuxeCart Admin Panel",
  description: "LuxeCart Admin Dashboard - Manage your premium e-commerce platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} bg-luxury-black text-text-primary antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#16213E",
              color: "#FFFFFF",
              border: "1px solid rgba(184, 134, 11, 0.3)",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10B981", secondary: "#16213E" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#16213E" } },
          }}
        />
      </body>
    </html>
  );
}
