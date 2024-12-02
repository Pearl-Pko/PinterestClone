import React from "react";
import { ErrorIcon } from "@web/public";
import { AlertError } from "@web/public";

export default function ErrorInputField({
  message,
  type = "",
}: {
  message: string;
  type?: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      {type === "alert" ? (
        <AlertError fill="#E60023" width={30} height={30}/>
      ) : (
        <ErrorIcon fill="#E60023" />
      )}
      <p className="text-red-700">{message}</p>
    </div>
  );
}
