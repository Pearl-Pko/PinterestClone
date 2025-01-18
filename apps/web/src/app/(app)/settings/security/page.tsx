"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@web/src/components/ui/checkbox";
import { useGetProfile, useUnlinkProvider } from "@web/src/service/useUser";
import React from "react";

export default function page() {
  const queryClient = useQueryClient();
  
  const {data} = useQuery({
    queryKey: ["profile"],
    queryFn: useGetProfile
  })


  const {mutate} = useMutation({
    mutationFn: useUnlinkProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['profile']});
    }
  })

  const handleGoogleLink = async () => {
    window.open("/api/user/google/link", "_blank", "width=500,height=600");
  };

  return (
    <div className="w-[500px]">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium">Security</h1>
        <p>
          Include additional security such as turnining on two-factor
          authentication and checking your list of connected devices to keep
          your accout, Pins and boards safe.
        </p>
      </div>
      <div className="my-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">Two-factor authentication</h2>
          <p>
            This makes your account extra secure. Along with your password,
            you'll need to enter the secret code we text to your phone each time
            you log in
          </p>
        </div>
        <div className="flex flex-row items-center gap-3 my-3">
          <Checkbox />
          <p>Require code at login</p>
        </div>
      </div>
      <div className="my-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">Login options</h2>
          <p>Use your social account to log in to pinterest</p>
        </div>
        <div className="flex flex-row items-center gap-3 my-3">
          <Checkbox checked={data?.providers.includes("google")} onCheckedChange={(checked) => {
            if (checked) {
              handleGoogleLink();
            }
            else {
              mutate({provider: "google"});
            }
          }}/>
          <p>Use your Google account to log in</p>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-medium">Connected devices</h2>
        <p>This is a list of devices that have logged in to your account. Revoke access to any devices you don't recognise</p>
      </div>
    </div>
  );
}
