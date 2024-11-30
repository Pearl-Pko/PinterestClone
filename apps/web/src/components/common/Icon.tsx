import { cn } from "@web/src/lib/utils";
import React from "react";

type Props = {
  icon: any;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Icon({ icon, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn("active:scale-[.85] transition-transform hover:bg-gray-200 active:bg-gray-300 p-2 rounded-full transition-colors", props.className)}
    >
      {icon}
    </button>
  );
}
