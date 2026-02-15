import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GymTrack API",
  description: "Backend para GymTrack",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
