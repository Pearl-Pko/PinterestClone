import "./globals.css";
import SearchField from "../components/SearchField";
import NotificationsIcon from "@web/public/notifications.svg";
import MessagingIcon from "@web/public/messaging.svg";
import PinterestIcon from "@web/public/pinterest-logo.svg";
import { SessionProvider } from "../context/SessionContext";
import AppProvider from "./AppProvider";
import 'reflect-metadata';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div className="p-4 flex gap-5 items-center">
            <PinterestIcon fill="#E60023" />
            <p>Home</p>
            <p>Create</p>
            <div className="flex-1">
              <SearchField />
            </div>
            <NotificationsIcon fill="grey" />
            <MessagingIcon fill="grey" />
          </div>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
