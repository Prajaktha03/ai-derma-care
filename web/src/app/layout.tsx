import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Skin Specialist | Voice and Image Consultation",
  description: "Share a skin concern with voice and image for general AI-assisted guidance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
