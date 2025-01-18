"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export type CallbackMessage = {
  error?: string;
  status?: "success" | "faliure";
  source?: string;
  redirectAddress?: string;
};

export default function page() {
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("redire", searchParams.get("redirectAddress"));

    if (window.opener) {
      window.opener.postMessage(
        {
          status: "success",
          source: "auth",
          redirectAddress: decodeURIComponent(searchParams.get("redirectAddress") || ""),
        } as CallbackMessage,
        "/",
      );
      window.close();
    }
  }, [searchParams]);

  return <div></div>;
}
