"use client";
import React, {useEffect} from "react";
import PinDraftIcon from "@web/public/pin-drafts.svg";
import ResetPinIcon from "@web/public/reset-pin.svg";
import UploadIcon from "@web/public/upload.svg";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import api from "@web/src/utils/api";
import clsx from "clsx";
import {z} from "zod";

import ErrorIcon from "@web/public/error.svg";

// type FormValues = {
//     title: string;
//     external_linK: string;
//     image_url: string;
//     description: string;
//     tags: string;
//     author_id: string;
// };

const schema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    external_link: z
        .string()
        .url("That url is not valid. Please try again")
        .optional()
        .or(z.literal("")),
    tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function page() {
    const {
        register,
        handleSubmit,
        setError,
        watch,
        formState: {errors, isSubmitting},
    } = useForm<FormValues>({resolver: zodResolver(schema)});
    useEffect(() => {
        // setError("external_link", {type: "dew", message: "Invalid url"})
    }, []);
    const onSubmit = async (data: FormValues) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await api.post("/posts", {
            ...data,
            author_id: "0313bcd5-46cc-4d33-8295-c9ce9cae85bc",
            image_url: "dklekw",
        });
    };

    console.log(errors);

    return (
        <div className="flex justify-center items-start">
            <div className="p-7 flex gap-12 border-2 border-r-0 flex-col">
                <PinDraftIcon />
                <ResetPinIcon />
            </div>
            <form
                className="flex-1 border-l-2 h-screen"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="p-4 border-2 border-l-0 flex justify-between items-center">
                    <p className="font-semibold text-lg">Create Pin</p>
                    <button
                        type="submit"
                        className={clsx(
                            "font-semibold text-md text-white bg-[#E60023] px-4 py-2 rounded-full",
                            isSubmitting && "opacity-30"
                        )}
                        disabled={isSubmitting}
                    >
                        Publish
                    </button>
                </div>
                <div className="grid my-10 mx-auto place-content-center grid-cols-5 max-w-[1000px] gap-10">
                    <div className="col-span-2 flex gap-5 flex-col">
                        <div className="bg-gray-200 relative rounded-3xl h-[400px] grid place-content-center">
                            <div className="flex flex-col justify-center items-center">
                                <UploadIcon />
                                <p>Choose a file or drag and drop it here</p>
                            </div>
                            <p className="absolute bottom-0 p-3 text-center font-sm">
                                We recommend using high-quality .jpg files less
                                than 20MB or .mp4 files less than 200MB
                            </p>
                        </div>
                        <p className="bg-gray-200 p-3 rounded-2xl font-semibold text-center">
                            Save from URL
                        </p>
                    </div>
                    <div className="col-span-3 flex flex-col gap-5">
                        <div>
                            <p id="title">Title</p>
                            <input
                                {...register("title")}
                                placeholder="Add a title"
                                className="mt-1 focus:outline-none border-2 rounded-2xl px-3 py-2 w-full"
                            />
                        </div>
                        <div>
                            <p>Description</p>
                            <textarea
                                {...register("description")}
                                placeholder="Add a detailed description"
                                className="mt-1 h-28 focus:outline-none border-2 rounded-2xl px-3 py-2 w-full resize-none"
                            />
                        </div>
                        <div>
                            <p>Link</p>
                            <input
                                {...register("external_link")}
                                placeholder="Add a link"
                                className="mt-1 focus:outline-none border-2 rounded-2xl px-3 py-2 w-full"
                            />
                            {errors.external_link && (
                                <div className="flex gap-2 items-center">
                                    <ErrorIcon fill="#E60023" />
                                    <p className="text-red-700">
                                        {errors.external_link.message}
                                    </p>
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
                                {...register("tags")}
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
