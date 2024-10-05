"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@web/src/actions/auth";
import ErrorInputField from "@web/src/components/common/ErrorInputField";
import PrimaryButton from "@web/src/components/common/PrimaryButton";
import { useLogin, useSignUp } from "@web/src/service/useUser";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ChangePassword, CreateUserDto, LoginUserDto, ResetPasswordDto } from '@schema/user';


export default function page() {
  const router = useRouter();
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
    <div className="flex justify-center items-center">
      <div className="border-2 max-w-[600px] w-full rounded-2xl py-3 flex justify-center">
        <form
          className="flex justify-center flex-col w-3/5 items-center"
          onSubmit={handleSubmit(mutate)}
          // action={handleSubmi)}
        >
          <p className="text-3xl font-semibold">Log in to see more </p>
          <div className="flex flex-col gap-3 w-full mt-8 mb-4">
            <div>
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
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                {...register("password")}
                className="input"
                placeholder="Password"
              />
              {errors.password?.message && (
                <ErrorInputField message={errors.password.message} />
              )}
            </div>
          </div>
          {errors.root && (
            <div className="bg-red-400 self-start text-white w-full my-2 rounded-lg px-3 py-2">
              {errors.root.message}
            </div>
          )}
          <PrimaryButton
            type="submit"
            text="Continue"
            className="w-full"
            // disabled={!isDirty}
            // disabled={!isValid}
            // loading={isSubmitting}
          />
          <p className="mt-5 font-medium text-sm text-[#777777]">Not on Pinterest yet? <Link href="/signup" className="text-black">Sign up</Link></p>
        </form>
      </div>
    </div>
  );
}
