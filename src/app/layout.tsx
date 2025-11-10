import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ismail.kattakath.com'),
  title: "Ismail Kattakath - Principal Software Engineer & Technical Leader",
  description: "Principal Software Engineer & Technical Leader | 15+ Years Architecting Full-Stack & AI/ML Solutions | OAuth/SSO Authentication, CI/CD Automation, Kubernetes, MCP Gateways, RAG Systems & Production GenAI",
  keywords: "Principal Software Engineer, Technical Leader, Full Stack, AI/ML, OAuth, SSO, CI/CD, Kubernetes, MCP Gateways, RAG Systems, GenAI, Machine Learning, Cloud Architecture",
  authors: [{ name: "Ismail Kattakath" }],
  openGraph: {
    title: "Ismail Kattakath - Principal Software Engineer & Technical Leader",
    description: "15+ Years Architecting Full-Stack & AI/ML Solutions | Specializing in OAuth/SSO, CI/CD, Kubernetes, MCP Gateways, RAG Systems & Production GenAI Pipelines",
    url: "https://ismail.kattakath.com",
    siteName: "Ismail Kattakath - Portfolio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ismail Kattakath - Principal Software Engineer & Technical Leader",
    description: "15+ Years Architecting Full-Stack & AI/ML Solutions | OAuth/SSO, CI/CD, Kubernetes, MCP Gateways, RAG Systems & Production GenAI",
    creator: "@ismailkattakath",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundImage: 'url(/images/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        {children}
      </body>
    </html>
  );
}
