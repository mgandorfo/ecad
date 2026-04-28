import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "E-CAD — Gestão de Atendimentos",
    template: "%s | E-CAD",
  },
  description:
    "Sistema de gestão de atendimentos do Cadastro Único (CadÚnico) para a Secretaria de Assistência Social de Caarapo - MS.",
  keywords: ["CadÚnico", "atendimentos", "assistência social", "Caarapo", "E-CAD"],
  authors: [{ name: "Prefeitura Municipal de Caarapo" }],
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "E-CAD — Gestão de Atendimentos",
    description:
      "Sistema de gestão de atendimentos do Cadastro Único para a Secretaria de Assistência Social de Caarapo - MS.",
    siteName: "E-CAD",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
