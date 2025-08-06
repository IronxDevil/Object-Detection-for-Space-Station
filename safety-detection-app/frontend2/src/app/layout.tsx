import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import { DetectionHistoryProvider } from "@/context/DetectionHistoryContext";

export const metadata: Metadata = {
  title: "Space Station Safety Detection",
  description: "Real-time safety equipment detection using YOLOv8 for space station inventory management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-body">
        <DetectionHistoryProvider>
          <Navigation />
          <div className="pt-16">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </DetectionHistoryProvider>
      </body>
    </html>
  );
}
