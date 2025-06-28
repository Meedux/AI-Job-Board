import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GetGetHired - Latest Remote Tech Jobs",
  description: "Find the best remote tech jobs and grow your career. We share the latest opportunities in software engineering, design, marketing, and more.",
  keywords: "remote jobs, tech jobs, software engineer, developer jobs, work from home",
  authors: [{ name: "GetGetHired" }],
  openGraph: {
    title: "GetGetHired - Latest Remote Tech Jobs",
    description: "Find the best remote tech jobs and grow your career",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-[72px] lg:pt-0`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
