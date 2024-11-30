"use client";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { ResetPasswordDto } from "@schema/user";
import { PasswordEyeIcon, PasswordHiddenEyeIcon } from "@web/public";
import ErrorInputField from "@web/src/components/common/ErrorInputField";
import Button from "@web/src/components/common/Button";
import { ResetPasswordDtoWithConfirmation } from "@web/src/schema/user";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useResetPassword } from "@web/src/service/useUser";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

export default function page() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, },
  } = useForm<ResetPasswordDtoWithConfirmation>({
    resolver: classValidatorResolver(ResetPasswordDtoWithConfirmation),
    defaultValues: {
      token: searchParams.get("token") || undefined
    }
  });

  const mutate = async (data: ResetPasswordDtoWithConfirmation) => {
    try {
      await useResetPassword(data);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("root", { message: error.response?.data?.message });
      }
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form className="max-w-[400px] flex flex-col w-full" onSubmit={handleSubmit(mutate)}>
        <h1 className="text-3xl font-semibold text-center ">
          Pick a new Password
        </h1>
        <div className="flex flex-col w-full gap-3 mt-5 mb-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="newPassword" className="font-semibold">
              New Password
            </label>
            <div className="flex flex-row items-center justify-between input ">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                {...register("newPassword")}
                className="flex-1 focus:outline-none border-0 appearance-none [-webkit-text-security-:_circle] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                placeholder="Enter a new password"
              />
              <div onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <PasswordHiddenEyeIcon /> : <PasswordEyeIcon />}
              </div>
            </div>
            {errors.newPassword?.message && (
              <ErrorInputField message={errors.newPassword.message} />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="newPassword" className="font-semibold">
              Type it again
            </label>
            <div className="flex flex-row items-center justify-between input ">
              <input
                id="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmNewPassword")}
                className="flex-1 focus:outline-none border-0 appearance-none [-webkit-text-security-:_circle] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                placeholder="Re-enter password"
              />
              <div onClick={() => setShowConfirmPassword((value) => !value)}>
                {showConfirmPassword ? (
                  <PasswordHiddenEyeIcon />
                ) : (
                  <PasswordEyeIcon />
                )}
              </div>
            </div>
            {errors.confirmNewPassword?.message && (
              <ErrorInputField message={errors.confirmNewPassword.message} />
            )}
          </div>
        </div>
        <Button type="submit" text="Change Password" className="self-end px-3 py-1" />
      </form>
    </div>
  );
}
