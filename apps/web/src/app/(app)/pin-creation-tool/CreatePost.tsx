import "reflect-metadata";
import React, { FormEventHandler, useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@web/src/utils/api";
import Button from "@web/src/components/common/Button";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { debounce } from "lodash";
import {
  useCreatePost,
  useGetPost,
  usePublishPost,
  useUpdatePost,
} from "@web/src/service/usePosts";
import { AxiosError, AxiosResponse } from "axios";
import {
  EditIcon,
  ErrorIcon,
  OpenSideNavIcon,
  ResetPinIcon,
  UploadIcon,
} from "@web/public";
import { CreatePostWebDto } from "@web/src/schema/post";
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginatedResponse } from "@schema/util";
import { PostEntity } from "@schema/post";

export default function CreatePost({
  selectedPostId,
  onPublish,
}: {
  selectedPostId: string;
  onPublish: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [postId, setPostId] = useState("");
  const queryClient = useQueryClient();

  const initialData = useMemo(
    () =>
      queryClient
        .getQueryData<
          AxiosResponse<PaginatedResponse<PostEntity>>
        >(["getAllPosts", "draft"])
        ?.data.data.find((post) => post.id === postId),
    [postId],
  );

  const { data } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => useGetPost(postId),
    enabled: !!postId,
    initialData: () => initialData,
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(["getAllPosts", "draft"])?.dataUpdatedAt,
  });

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
    defaultValues: data,
    mode: "onChange",
  });

  const invalidatePosts = () => {
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
    queryClient.invalidateQueries({ queryKey: ["getAllPosts", "draft"] });
  };

  const createPostMutation = useMutation({
    mutationFn: useCreatePost,
    onSuccess: (data) => {
      setPostId(data.data.id);
      invalidatePosts();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: useUpdatePost,
    onSuccess: () => {
      invalidatePosts();
    },
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
        invalidatePosts();
        onPublish();
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
    } else {
      setError("content", { message: "Image must be specified" });
    }
  };

  const resetForm = () => {
    setPostId("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    // reset({

    // });
    reset({
      content: undefined,
      description: "",
      external_link: "",
      tags: "",
      title: "",
    });
    setError("content", { message: "Image must be specified" });
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

  useEffect(() => {
    // if (selectedPostId) {

    console.log("selected post id", selectedPostId);
    resetForm();
    setPostId(selectedPostId);
    // }
  }, [selectedPostId]);

  useEffect(() => {
    if (!initialData) return;
    reset(initialData);
    if (initialData?.content_uri) setPreviewUrl(initialData.content_uri);
  }, [initialData]);

  return (
    <form
      className={clsx(
        "flex-1 border-l-2 h-full w-full flex flex-col",
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
              {createPostMutation.submittedAt || updatePostMutation.submittedAt
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
      <div className="p-5 gap-10 flex flex-row justify-center w-full flex-1 overflow-y-auto">
        <div className="flex gap-5 flex-col w-[350px]">
          {!previewUrl ? (
            <label
              htmlFor="content"
              className="bg-gray-200 relative rounded-3xl h-full grid place-content-center"
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
            <div className="relative">
              <label
                htmlFor="content"
                className="w-10 h-10 absolute bg-white rounded-full right-3 top-3 flex justify-center items-center"
              >
                <EditIcon />
              </label>
              <img
                src={previewUrl}
                className="object-cover w-full h-full object-center rounded-3xl"
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
          {!selectedPostId && <p className="bg-gray-200 p-3 rounded-2xl font-semibold text-center">
            Save from URL
          </p>}
        </div>
        <div
          className={clsx(
            "flex flex-col gap-5 max-w-[500px] w-full",
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
  );
}
