import SearchField from "../components/SearchField";
import "./globals.css";
import NotificationsIcon from "@/public/notifications.svg"
import MessagingIcon from "@/public/messaging.svg"
import PinterestIcon from "@/public/pinterest-logo.svg"

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div className="p-4 flex gap-5 items-center">
                    <PinterestIcon fill="#E60023"/>
                    <p>Home</p>
                    <p>Create</p>
                    <div className="flex-1">
                        <SearchField/>
                    </div>
                    <NotificationsIcon fill="grey"/>
                    <MessagingIcon fill="grey"/>

                </div>
                {children}
            </body>
        </html>
    );
}
