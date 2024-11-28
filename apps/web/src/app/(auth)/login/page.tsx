"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@web/src/actions/auth";
import ErrorInputField from "@web/src/components/common/ErrorInputField";
import Button from "@web/src/components/common/Button";
import { useLogin, useSignUp } from "@web/src/service/useUser";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import {
  ChangePassword,
  CreateUserDto,
  LoginUserDto,
  ResetPasswordDto,
} from "@schema/user";
import { PasswordEyeIcon, PasswordHiddenEyeIcon } from "@web/public";

export default function page() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<LoginUserDto>({ resolver: classValidatorResolver(LoginUserDto) });

  const mutate = async (user: LoginUserDto) => {
    try {
      await useLogin(user);
      router.push("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        setError("root", { message: error.response?.data?.message });
      }
      console.error(error);
    }
  };

  console.log("yes", errors);
  return (
    <div className="flex items-center justify-center">
      <div className="border-2 max-w-[600px] w-full rounded-2xl py-3 flex justify-center">
        <form
          className="flex flex-col items-center justify-center w-3/5"
          onSubmit={handleSubmit(mutate)}
          // action={handleSubmi)}
        >
          <p className="text-3xl font-semibold">Log in to see more </p>
          <div className="flex flex-col w-full gap-3 mt-8 mb-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                {...register("email")}
                className="input"
                placeholder="Email address"
              />
              {errors.email?.message && (
                <ErrorInputField message={errors.email.message} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password">Password</label>
              <div className="flex flex-row items-center justify-between input ">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="flex-1 focus:outline-none border-0 appearance-none [-webkit-text-security-:_circle] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  placeholder="Password"
                />
                <div onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? (
                    <PasswordHiddenEyeIcon />
                  ) : (
                    <PasswordEyeIcon />
                  )}
                </div>
              </div>
              {errors.password?.message && (
                <ErrorInputField message={errors.password.message} />
              )}
            </div>
          </div>
          {errors.root && (
            <div className="self-start w-full px-3 py-2 my-2 text-white bg-red-400 rounded-lg">
              {errors.root.message}
            </div>
          )}
          <Link className="self-start mb-2 text-sm font-medium" href="/password/reset">
            Forgotton your Password?
          </Link>
          <Button
            type="submit"
            text="Continue"
            className="w-full"
            // disabled={!isDirty}
            // disabled={!isValid}
            // loading={isSubmitting}
          />
          <p className="mt-5 font-medium text-sm text-[#777777]">
            Not on Pinterest yet?{" "}
            <Link href="/signup" className="text-black">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
