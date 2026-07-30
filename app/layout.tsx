import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import { StorageProviderClient } from "@/components/StorageProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";


export const metadata: Metadata = {
  title: "🏋️ GYMBEND",
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
      <body className="antialiased">
        <Script id="gymbend-cache-clear" strategy="beforeInteractive">
          {`
            (function () {
              if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                  registrations.forEach(function (registration) {
                    registration.unregister();
                  });
                });
              }
              if (typeof caches !== "undefined") {
                caches.keys().then(function (names) {
                  names.forEach(function (name) {
                    caches.delete(name);
                  });
                });
              }
            })();
          `}
        </Script>
        <div id="mobile-root">
          <StorageProviderClient>{children}</StorageProviderClient>
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
