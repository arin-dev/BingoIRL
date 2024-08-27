import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BingoIRL",
  description: "Created by Arin Dev",
  // icons : {
  //   icon: "./rahulGitHub.jpeg",
  // }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="./rahulGitHub.jpeg" /> 
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}