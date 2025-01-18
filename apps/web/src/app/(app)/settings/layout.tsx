import Link from "next/link";
import React, { useState } from "react";
import NavBar from "./NavBar";

export default function page({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <div className="p-10 flex flex-row gap-36">
      <NavBar/>
      {children}
    </div>
  );
}
