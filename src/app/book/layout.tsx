import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Meeting",
  description: "Let's discuss how we can work together.",
  openGraph: {
    title: "Book Meeting",
    description: "Let's discuss how we can work together.",
    type: "website",
    url: "https://ismail.kattakath.com/book",
  },
  twitter: {
    card: "summary",
    title: "Book Meeting",
    description: "Let's discuss how we can work together.",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
