import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { PageTransition } from "~/components/page-transition";

export const metadata: Metadata = {
  title: "Time Capsule",
  description: "Send a message to your future self.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-slate-950 font-sans antialiased">
        <TRPCReactProvider>
          <PageTransition>{children}</PageTransition>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
