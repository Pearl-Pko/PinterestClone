"use client";
import { cn } from "@web/src/lib/utils";
import Link from "next/link";
import React, { useState } from "react";

export default function NavBar() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabs: Record<string, string> = {
    "Edit Profile": "edit-profile",
    "Account management": "account-settings",
    "Profile visibilty": "profile-visibility",
    "Tune your home feed": "edit",
    "Claimed accounts": "claim",
    "Social permissions": "permissions",
    Notifications: "notifications",
    "Privacy and data": "privacy",
    Security: "security",
  };
  return (
    <div className=" gap-2 flex flex-col items-start">
      {Object.keys(tabs).map((tab, index) => {
        return (
          <Link
            className={cn(selectedIndex === index && "border-b-2 border-black")}
            key={index}
            href={`/settings/${tabs[tab]}`}
            onClick={() => setSelectedIndex(index)}
          >
            <p  className={cn(
              "font-medium w-auto p-2 hover:bg-gray-200  rounded-md",
            )}>{tab}</p>
          </Link>
        );
      })}
    </div>
  );
}
