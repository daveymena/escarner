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
  title: "TapScanner Pro - Escáner Profesional con IA",
  description: "Aplicación profesional para escanear documentos, IDs, códigos QR y libros con reconocimiento OCR integrado y filtros avanzados",
  keywords: "escáner, PDF, OCR, documentos, ID, QR, libros, cámara, móvil, web, IA, inteligencia artificial",
  authors: [{ name: "TapScanner Pro" }],
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
