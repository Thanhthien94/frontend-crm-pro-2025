import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // Thêm Toaster nếu chưa có

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}