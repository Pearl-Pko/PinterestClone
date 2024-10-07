import clsx from "clsx";
import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  loading?: boolean;
  primary?: boolean;
}

export default function Button({ primary = true, ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        "font-semibold   px-5 py-3 rounded-full",
        (props.loading || props.disabled) && "opacity-30",
        primary ? "bg-[#E60023] text-white" : "bg-gray-200",

        props.className,
      )}
      disabled={props.disabled || props.loading}
      //   disabled={props.submitting}
    >
      {props.text}
    </button>
  );
}
