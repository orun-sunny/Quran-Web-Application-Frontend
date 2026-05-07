import { Inter, Amiri_Quran } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Context/Providers";
import { MainApp } from "@/components/Layout/MainApp";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-amiri-quran",
});

export const metadata = {
  title: "Quran Mazid",
  description: "Read, Study, and Learn The Quran",
  icons: {
    icon: "./logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${amiriQuran.variable}`}>
        <Providers>
          <MainApp>{children}</MainApp>
        </Providers>
      </body>
    </html>
  );
}
