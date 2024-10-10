"use client"
import React from "react";
import api from "@web/src/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useGetProfile } from "@web/src/service/useUser";
import { PinterestIcon } from "@web/public";

export default function page({
  params,
}: {
  params: { userName: string };
}) {
  const {data} = useQuery({queryKey: ["profile"], queryFn: useGetProfile})

  console.log("data", data);
  return (
    <div className="grid mt-10 place-content-center">
      <div className="text-center">
        <div className="flex justify-center text-4xl font-bold">
          <p className="flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full">
            {(data?.last_name || "A")[0]}
          </p>
        </div>
        <p className="m-3 text-2xl font-semibold">{data?.full_name}</p>
        <div className="flex items-center justify-center">
          <PinterestIcon fill="grey" />
          <p className="m-1 text-gray-500">{data?.username}</p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <button>
            <div className="px-4 py-2 bg-gray-200 rounded-full">
              <p>Share</p>
            </div>
          </button>
          <button>
            <div className="px-4 py-2 bg-gray-200 rounded-full">
              <p>Edit Profile</p>
            </div>
          </button>
        </div>
      </div>
      <div className="flex justify-center gap-5 mt-10">
        <button>
          <div>
            <p>Created</p>
          </div>
        </button>
        <button>
          <div>
            <p>Saved</p>
          </div>
        </button>
      </div>
    </div>
  );
}
