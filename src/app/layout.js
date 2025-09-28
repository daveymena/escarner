import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../contexts/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mi Escáner PDF - Escanea y genera PDFs",
  description: "Aplicación profesional para escanear documentos con la cámara y generar archivos PDF de alta calidad",
  keywords: "escáner, PDF, documentos, cámara, móvil, web",
  authors: [{ name: "Mi Escáner PDF" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
