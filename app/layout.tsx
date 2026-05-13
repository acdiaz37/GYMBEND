import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StorageProviderClient } from "@/components/StorageProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "GYMBEND",
  description: "Premium stretching & home workout",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GYMBEND",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-black">
        <div id="mobile-root">
          <StorageProviderClient>{children}</StorageProviderClient>
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
