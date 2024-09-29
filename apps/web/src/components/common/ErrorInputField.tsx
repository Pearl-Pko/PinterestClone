import React from "react";
import ErrorIcon from "@web/public/error.svg";

export default function ErrorInputField({message}: {message: string}) {
  return (
    <div className="flex gap-2 items-center">
      <ErrorIcon fill="#E60023" />
      <p className="text-red-700">{message}</p>
    </div>
  );
}
