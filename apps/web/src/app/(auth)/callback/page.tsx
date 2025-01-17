"use client"
import React, { useEffect } from "react";

export type CallbackMessage = {
  error?: string;
  status?: "success" | "faliure";
  source?: string;
};

export default function page() {
  
  if (window.opener) {
    window.opener.postMessage(
      { status: "success", source: "auth" } as CallbackMessage,
      "/",
    );
    window.close();
  }
  return <div></div>;
}
