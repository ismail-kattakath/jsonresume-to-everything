import type { Metadata } from "next";

const TITLE = "Book Meeting";
const DESCRIPTION = "Let's discuss how we can work together.";
const URL = "https://ismail.kattakath.com/book";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: URL,
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
