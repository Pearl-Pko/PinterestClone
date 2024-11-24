import "reflect-metadata";
import "./globals.css";
import AppProvider from "./AppProvider";
import DrawerHeader from "../components/DrawerHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DrawerHeader/>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
