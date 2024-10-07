"use client";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { ForgotPasswordDto } from "@schema/user";
import ErrorInputField from "@web/src/components/common/ErrorInputField";
import Button from "@web/src/components/common/Button";
import { useForgotPassword } from "@web/src/service/useUser";
import { AxiosError } from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

export default function page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ForgotPasswordDto>({
    resolver: classValidatorResolver(ForgotPasswordDto),
    defaultValues: {
      email: searchParams.get("ue") || undefined,
    },
  });

  const mutate = async (data: ForgotPasswordDto) => {
    try {
      await useForgotPassword(data);
      updateSearchParams();
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("root", { message: error.response?.data?.message });
      }
      console.error(error);
    }
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("ue", getValues("email"));

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-center w-full">
      <form
        onSubmit={handleSubmit(mutate)}
        className="flex-col flex justify-center items-center max-w-[500px] w-full"
      >
        {!isSubmitSuccessful ? (
          <>
            <p className="text-3xl font-semibold">Reset your password</p>
            <p className="m-2 text-gray-600">
              What's your email address, name or username?
            </p>
            <div className="flex flex-col w-full gap-1 m-5">
              <input
                id="email"
                {...register("email")}
                className="w-full input"
                placeholder="Enter your email address"
              />
              {errors.email?.message && (
                <ErrorInputField message={errors.email.message} />
              )}
            </div>
            {errors.root && (
              <div className="self-start w-full px-3 py-2 my-2 text-white bg-red-400 rounded-lg">
                {errors.root.message}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              text="Send a password reset email"
            />
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold">Email sent</p>
            <p className="m-8 text-center">
              We sent an email to {searchParams.get("ue")}. If this email is
              connected to a Pinterest account, you'll be able to reset your
              password{" "}
            </p>
            <div className="flex flex-row items-center justify-center w-full gap-3">
              <Button
                text="Try again"
                primary={false}
                onClick={() =>
                  reset({ email: searchParams.get("ue") || undefined })
                }
              />
              <Button
                text="Back to login"
                onClick={() => router.push("/login")}
              />
            </div>
          </>
        )}
      </form>
    </div>
  );
}
