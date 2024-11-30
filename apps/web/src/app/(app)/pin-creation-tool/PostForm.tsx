import { ErrorIcon } from "@web/public";
import { cn } from "@web/src/lib/utils";
import { CreatePostWebDto } from "@web/src/schema/post";
import React from "react";
import { useFormContext } from "react-hook-form";

export default function PostForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreatePostWebDto>();
  return (
    <>
      <div>
        <p id="title">Title</p>
        <input
          {...register("title", {
            setValueAs: (value) => value || undefined,
          })}
          placeholder="Add a title"
          className="mt-1 focus:outline-none border-2 rounded-2xl px-3 py-2 w-full"
        />
      </div>
      <div>
        <p>Description</p>
        <textarea
          {...register("description", {
            setValueAs: (value) => value || undefined,
          })}
          placeholder="Add a detailed description"
          className="mt-1 h-28 focus:outline-none border-2 rounded-2xl px-3 py-2 w-full resize-none"
        />
      </div>
      <div>
        <p>Link</p>
        <input
          {...register("external_link", {
            setValueAs: (value) => value || undefined,
          })}
          placeholder="Add a link"
          className="mt-1 focus:outline-none border-2 rounded-2xl px-3 py-2 w-full"
        />
        {errors.external_link && (
          <div className="flex gap-2 items-center">
            <ErrorIcon fill="#E60023" />
            <p className="text-red-700">{errors.external_link.message}</p>
          </div>
        )}
      </div>
      <div>
        <p>Board</p>
        <input
          placeholder="Choose a board"
          className="mt-1 focus:outline-none border-2 rounded-2xl px-3 py-2 w-full"
        />
      </div>
      <div>
        <p>Tags</p>
        <input
          {...register("tags", {
            setValueAs: (value) => value || undefined,
          })}
          placeholder="Search for a tag"
          className="mt-1 focus:outline-none border-2 rounded-2xl px-3 py-2 w-full"
        />
        <p className="text-sm text-gray-500">
          Don't worry, people won't see your tags
        </p>
      </div>
    </>
  );
}
