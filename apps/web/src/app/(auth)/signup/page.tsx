"use client";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorInputField from "@web/src/components/common/ErrorInputField";
import PrimaryButton from "@web/src/components/common/PrimaryButton";
import { CreateUserDtoWithConfirmation } from "@web/src/schema/user";
import { useLogin, useSignUp } from "@web/src/service/useUser";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function page() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<CreateUserDtoWithConfirmation>({ resolver: classValidatorResolver(CreateUserDtoWithConfirmation) });

  // useEffect(() => {
  //   setError("root", {message: "wrong"})
  //   // setError("external_link", {type: "dew", message: "Invalid url"})
  // }, []);
  const mutate = async (data: CreateUserDtoWithConfirmation) => {
    const { confirmPassword, ...rest } = data;
    try {
      const data = (await useSignUp(rest)).data;
      console.log("data", data);
      router.push("/pin-creation-tool");
      // router.push()
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
        >
          <p className="text-3xl font-semibold">Sign up to see more </p>
          <p className="text-gray-600 text-lg m-2">Discovery starts here</p>
          <div className="flex flex-col gap-3 w-full mt-3 mb-4">
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
                placeholder="Create a password"
              />
              {errors.password?.message && (
                <ErrorInputField message={errors.password.message} />
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                {...register("confirmPassword")}
                className="input"
                placeholder="Confirm password"
              />
              {errors.confirmPassword?.message && (
                <ErrorInputField message={errors.confirmPassword.message} />
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
          <p className="text-sm font-medium mt-5 text-[#777777]">
            Already a member? <Link href="/login" className="text-black">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
