import clsx from "clsx";
import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  loading?: boolean;
};

export default function PrimaryButton(props: Props) {
  return (
    <button
      className={clsx(
          "font-semibold text-white bg-[#E60023] px-4 py-2 rounded-full",
          (props.loading || props.disabled) && "opacity-30",
          props.className,
      )}
      disabled={props.disabled || props.loading}
    //   disabled={props.submitting}
    >
      {props.text}
    </button>
  );
}
