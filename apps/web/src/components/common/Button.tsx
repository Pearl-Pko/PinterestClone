import { cn } from "@web/src/lib/utils";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export default function Button({ variant = 'primary', ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "font-semibold px-5 py-3 rounded-full",
        (props.loading || props.disabled) && "opacity-30",
        variant == "primary" ? "bg-[#E60023] text-white" : "bg-gray-200",
        props.className
      )}
      disabled={props.disabled || props.loading}
    >
      {props.text}
    </button>
  );
}
