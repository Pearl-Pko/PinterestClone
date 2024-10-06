import React from "react";
import { Logo, MessagingIcon, NotificationIcon } from "@web/public";
import SearchField from "./SearchField";
import Link from "next/link";
import { getServerSession } from "../actions/auth";

export default async function DrawerHeader() {
  const session = await getServerSession();

  return (
    <div className="flex items-center gap-5 p-4">
      <Logo fill="#E60023" />
      <Link href="/">Home</Link>
      <Link href="/pin-creation-tool">Create</Link>
      <div className="flex-1">
        <SearchField />
      </div>
      <NotificationIcon fill="grey" />
      <MessagingIcon fill="grey" />
      <Link
        href={`/user/${session?.username}`}
        className="flex items-center justify-center bg-gray-200 rounded-full bg-secondary h-9 w-9 "
      >
        {(session?.first_name || "A")[0]}
      </Link>
    </div>
  );
}
