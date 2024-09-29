import React from "react";
import api from "@web/src/utils/api";
import PinterestIcon from "@web/public/pinterest-logo.svg";

export default async function page({
  params,
}: {
  params: { userName: string };
}) {
  console.log("yess");
  const res = await api.get(`users/user-name/${[params.userName]}`);
  const data = res.data;

  return (
    <div className="mt-10 grid place-content-center">
      <div className="text-center">
        <div className="text-4xl font-bold flex justify-center">
          <p className="bg-gray-200 flex justify-center items-center w-24 h-24 rounded-full">
            {data["last_name"][0]}
          </p>
        </div>
        <p className="text-2xl font-semibold m-3">{`${data["first_name"]} ${data["last_name"]}`}</p>
        <div className="flex justify-center items-center">
          <PinterestIcon fill="grey" />
          <p className="m-1 text-gray-500">{data["user_name"]}</p>
        </div>

        <div className="mt-4 flex justify-center items-center gap-2">
          <button>
            <div className="bg-gray-200 px-4 py-2 rounded-full">
              <p>Share</p>
            </div>
          </button>
          <button>
            <div className="bg-gray-200 px-4 py-2 rounded-full">
              <p>Edit Profile</p>
            </div>
          </button>
        </div>
      </div>
      <div className="mt-10 flex justify-center gap-5">
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
