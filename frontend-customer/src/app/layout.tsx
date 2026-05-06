import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "LuxeCart - Premium E-Commerce",
  description: "Discover premium products at LuxeCart. A luxury shopping experience with curated collections.",
  keywords: "luxury, premium, e-commerce, shopping, fashion",
  openGraph: {
    title: "LuxeCart - Premium E-Commerce",
    description: "Discover premium products at LuxeCart.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} bg-luxury-black text-text-primary antialiased`}>
        <AuthProvider>
          <CartProvider>
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
                  boxShadow: "0 4px 24px rgba(184, 134, 11, 0.08)",
                },
                success: { iconTheme: { primary: "#10B981", secondary: "#16213E" } },
                error: { iconTheme: { primary: "#EF4444", secondary: "#16213E" } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
