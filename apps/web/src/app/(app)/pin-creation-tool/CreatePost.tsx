import "reflect-metadata";
import React, { FormEventHandler, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
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
  UploadIcon,
} from "@web/public";
import { CreatePostWebDto } from "@web/src/schema/post";
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginatedResponse } from "@schema/util";
import { PostEntity } from "@schema/post";
import PostForm from "./PostForm";
import { cn } from "@web/src/lib/utils";

export default function CreatePost({
  selectedPostId,
  onPublish,
  batchOperation,
}: {
  selectedPostId: string;
  onPublish: () => void;
  batchOperation: boolean;
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

  console.log(["post", postId]);

  const form = useForm<CreatePostWebDto>({
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
    //  errors: {
    //   content: {
    //     message: "Image must be specified",
    //     type: ""
    //   }
    //  }
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
      // queryClient.invalidateQueries({ queryKey: ["getAllPosts", "draft"] });
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
    const { content, description, external_link, tags, title } =
      form.getValues();

    if (content?.[0] || form.formState.dirtyFields.content) {
      formData.append("content", content?.[0]);
    }

    if (form.formState.dirtyFields.description)
      formData.append("description", description || "");

    if (form.formState.dirtyFields.external_link)
      formData.append("external_link", external_link || "");

    if (form.formState.dirtyFields.tags) formData.append("tags", tags || "");

    if (form.formState.dirtyFields.title) formData.append("title", title || "");

    return formData;
  };

  const onFormChange = async () => {
    console.log("a");
    const formData = getFormData();

    console.log(
      "form valid",
      form.formState.isValid,
      form.formState.isValidating,
      form.formState.errors,
    );

    if (!form.formState.isValid) return;

    if (createPostMutation.isPending) return;

    if (!postId) {
      // console.log("form", formData);
      createPostMutation.mutate(formData);
    } else {
      console.log("dirty", form.formState.dirtyFields);
      updatePostMutation.mutate({ id: postId, data: formData });
    }
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
        form.setError("root", { message: error.response?.data?.message });
      }

      console.error(error);
    }
  };

  const handleFileInputChange = async (file: FileList) => {
    const image = file?.[0];
    if (image) {
      const url = URL.createObjectURL(image);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
      form.clearErrors("content");
      await form.trigger("content");
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
    form.reset({
      content: undefined,
      description: "",
      external_link: "",
      tags: "",
      title: "",
    });
    form.setError("content", { message: "Image must be specified" });
    createPostMutation.reset();
    updatePostMutation.reset();
  };

  useEffect(() => {
    console.log("yeah");
    form.setError("content", { message: "Image must be specified" });
  }, [form.trigger]);

  // useEffect(() => {
  //   form.reset(data);
  // }, [data])
  console.log(form.formState.errors.content?.message);

  const validatefile = (file: FileList | null): boolean => {
    if (file?.length) {
      return true;
    } else {
      form.setError("content", { message: "Image must be specified" });
      return false;
    }
  };

  useEffect(() => {
    // if (selectedPostId) {
    setPostId(selectedPostId);
    if (selectedPostId) return;

    resetForm();
  }, [selectedPostId]);

  useEffect(() => {
    if (!data) return;
    console.log("cause");
    form.reset(data);
    form.clearErrors();
    if (data?.content_uri) setPreviewUrl(data.content_uri);
  }, [data]);

  return (
    <FormProvider {...form}>
      <form
        className={clsx(
          "flex-1 border-l-2 h-full w-full flex flex-col",
          (form.formState.isSubmitting || batchOperation) &&
            "opacity-35 pointer-events-none",
        )}
        onSubmit={form.handleSubmit(onSubmit)}
        onChange={(event) => {
          debounceFormChange();
        }}
      >
        <div className="p-4 border-2 border-l-0 flex justify-between items-center">
          <p className="font-semibold text-lg">Create Pin</p>

          {!form.formState.errors.content && (
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
                text={!form.formState.isSubmitting ? "Publish" : "Publishing"}
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
              control={form.control}
              render={({ field: { onChange } }) => {
                return (
                  <input
                    id="content"
                    accept="image/*"
                    type="file"
                    className="w-0 h-0"
                    onChange={async (e) => {
                      const files = e.target.files;
                      const validFile = validatefile(files);
                      if (validFile && files) {
                        onChange(files);
                        await handleFileInputChange(files);
                      }
                    }}
                  />
                );
              }}
            />
            {!selectedPostId && (
              <p className="bg-gray-200 p-3 rounded-2xl font-semibold text-center">
                Save from URL
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex flex-col gap-5 max-w-[500px] w-full",
              form.formState.errors.content && "opacity-35 pointer-events-none",
            )}
          >
            <PostForm />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
