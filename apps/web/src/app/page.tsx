"use client";
import React from "react";
import { useSignOut } from "../service/useUser";
import { clearSession } from "../actions/auth";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

export default function page() {
  const router = useRouter();

  const { mutate } = useMutation({
    mutationFn: useSignOut,
    onSuccess: () => {
      router.push("/login");
    },
    onError: () => {
      router.push("/login");
    },
  });

  return (
    <div>
      <div>page</div>
      <button className="bg-red-300" onClick={() => mutate()}>
        Log out
      </button>
    </div>
  );
}
