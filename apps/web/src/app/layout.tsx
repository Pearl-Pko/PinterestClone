import "reflect-metadata";
import "./globals.css";
import AppProvider from "./AppProvider";
import DrawerHeader from "../components/DrawerHeader";
import { Toaster } from "../components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        <div className="flex flex-col h-dvh max-h-dvh">
          <DrawerHeader />
          <div className="flex-1  max-h-full overflow-y-auto">
            {/* <p>ds</p> */}
            <AppProvider>{children}</AppProvider>
          </div>
        </div>
        <Toaster/>
      </body>
    </html>
  );
}
