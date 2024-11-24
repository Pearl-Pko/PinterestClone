"use client";
import "reflect-metadata";
import React, { FormEventHandler, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@web/src/utils/api";
import Button from "@web/src/components/common/Button";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { debounce } from "lodash";
import {
  useCreatePost,
  usePublishPost,
  useUpdatePost,
} from "@web/src/service/usePosts";
import { AxiosError } from "axios";
import {
  EditIcon,
  ErrorIcon,
  PinDraftIcon,
  ResetPinIcon,
  UploadIcon,
} from "@web/public";
import { CreatePostWebDto } from "@web/src/schema/post";
import clsx from "clsx";
import { useMutation } from "@tanstack/react-query";

export default function page() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [postId, setPostId] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    getValues,
    trigger,
    reset,
    watch,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreatePostWebDto>({
    resolver: classValidatorResolver(CreatePostWebDto, {
      transformer: {
        excludePrefixes: ["content"],
        // transformValue: (value) => value === '' ? null : value
      },
      validator: {
        skipMissingProperties: true,
        skipUndefinedProperties: true,
        skipNullProperties: true,
      },
    }),
  });

  const createPostMutation = useMutation({
    mutationFn: useCreatePost,
    onSuccess: (data) => {
      setPostId(data.data.id);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: useUpdatePost,
  });

  const getFormData = () => {
    const formData = new FormData();
    const { content, description, external_link, tags, title } = getValues();

    if (content?.[0]) {
      formData.append("content", content?.[0]);
    }

    if (description) formData.append("description", description || "");

    if (external_link) formData.append("external_link", external_link);

    if (tags) formData.append("tags", tags);

    if (title) formData.append("title", title);

    console.log("form data", formData);
    return formData;
  };

  const onFormChange = async () => {
    console.log("a");
    // await trigger("content")
    const formData = getFormData();

    if (!isValid) return;

    if (!postId) {
      // console.log("form", formData);
      createPostMutation.mutate(formData);
    } else updatePostMutation.mutate({ id: postId, data: formData });
  };

  const debounceFormChange = debounce(() => onFormChange(), 500);

  const onSubmit = async (data: CreatePostWebDto) => {
    try {
      if (postId) {
        await usePublishPost(postId);
        resetForm();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("root", { message: error.response?.data?.message });
      }

      console.error(error);
    }
  };

  const handleFileInputChange = (file: FileList) => {
    const image = file?.[0];
    if (image) {
      const url = URL.createObjectURL(image);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
    }
  };

  const resetForm = () => {
    setPostId("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    reset();
    createPostMutation.reset();
    updatePostMutation.reset();
  };

  useEffect(() => {
    console.log("yeah");
    setError("content", { message: "Image must be specified" });
  }, []);

  const file = watch("content");

  useEffect(() => {
    if (file?.length) {
      clearErrors("content");
      handleFileInputChange(file);
    } else {
      setError("content", { message: "Image must be specified" });
    }
  }, [file]);

  // console.log("submitted", submittedAt)
  return (
    <div className="flex justify-center items-start">
      <div className="p-7 flex gap-12 border-2 border-r-0 flex-col">
        <PinDraftIcon />
        <ResetPinIcon />
      </div>
      <form
        className={clsx(
          "flex-1 border-l-2 h-screen",
          isSubmitting && "opacity-35 pointer-events-none",
        )}
        onSubmit={handleSubmit(onSubmit)}
        onChange={(event) => {
          debounceFormChange();
        }}
      >
        <div className="p-4 border-2 border-l-0 flex justify-between items-center">
          <p className="font-semibold text-lg">Create Pin</p>

          {!errors.content && (
            <div className="flex justify-center items-center gap-4">
              <p className="text-gray-500">
                {createPostMutation.submittedAt ||
                updatePostMutation.submittedAt
                  ? createPostMutation.isPending || updatePostMutation.isPending
                    ? "Saving..."
                    : "Changes Stored!"
                  : ""}
              </p>
              <Button
                type="submit"
                disabled={!!!postId}
                text={!isSubmitting ? "Publish" : "Publishing"}
              />
            </div>
          )}
        </div>
        <div className="grid my-10 mx-auto place-content-center grid-cols-5 max-w-[1000px] gap-10">
          <div className="col-span-2 flex gap-5 flex-col">
            {!previewUrl ? (
              <label
                htmlFor="content"
                className="bg-gray-200 relative rounded-3xl h-[400px] grid place-content-center"
              >
                <div className="flex flex-col justify-center items-center">
                  <UploadIcon />
                  <p>Choose a file or drag and drop it here</p>
                </div>
                <p className="absolute bottom-0 p-3 text-center font-sm">
                  We recommend using high-quality .jpg files less than 20MB or
                  .mp4 files less than 200MB
                </p>
              </label>
            ) : (
              <div className="rounded-3xl h-[400px] relative overflow-hidden">
                <label
                  htmlFor="content"
                  className="w-10 h-10 absolute bg-white rounded-full right-3 top-3 flex justify-center items-center"
                >
                  <EditIcon />
                </label>
                <img
                  src={previewUrl}
                  className="object-cover w-full h-full object-center "
                />
              </div>
            )}
            <Controller
              name="content"
              control={control}
              render={({ field: { onChange } }) => {
                return (
                  <input
                    id="content"
                    accept="image/*"
                    type="file"
                    className="w-0 h-0"
                    onChange={(e) => onChange(e.target.files)}
                  />
                );
              }}
            />
            <p className="bg-gray-200 p-3 rounded-2xl font-semibold text-center">
              Save from URL
            </p>
          </div>
          <div
            className={clsx(
              "col-span-3 flex flex-col gap-5",
              errors.content && "opacity-35 pointer-events-none",
            )}
          >
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
          </div>
        </div>
      </form>
    </div>
  );
}
