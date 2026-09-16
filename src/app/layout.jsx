import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "digital.HEROES — Golf Performance & Charity Draw Platform",
  description:
    "Track your golf scores in Stableford format (1–45), support verified charities, and participate in monthly draw prize pools.",
  keywords: [
    "digital.HEROES",
    "Golf Performance",
    "Charity Draws",
    "Stableford Golf",
    "Non-Profit Giving",
    "Golf Charity Days",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen flex flex-col bg-[#08090C] text-slate-100 font-sans selection:bg-amber-400/30 selection:text-amber-200">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#11141B",
                borderColor: "rgba(255, 255, 255, 0.1)",
                color: "#F8FAFC",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
