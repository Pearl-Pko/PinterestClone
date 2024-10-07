"use client";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordEyeIcon, PasswordHiddenEyeIcon } from "@web/public";
import ErrorInputField from "@web/src/components/common/ErrorInputField";
import Button from "@web/src/components/common/Button";
import { CreateUserDtoWithConfirmation } from "@web/src/schema/user";
import { useLogin, useSignUp } from "@web/src/service/useUser";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function page() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<CreateUserDtoWithConfirmation>({
    resolver: classValidatorResolver(CreateUserDtoWithConfirmation),
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);


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
    <div className="flex items-center justify-center">
      <div className="border-2 max-w-[600px] w-full rounded-2xl py-3 flex justify-center">
        <form
          className="flex flex-col items-center justify-center w-3/5"
          onSubmit={handleSubmit(mutate)}
        >
          <p className="text-3xl font-semibold">Sign up to see more </p>
          <p className="m-2 text-lg text-gray-600">Discovery starts here</p>
          <div className="flex flex-col w-full gap-3 mt-3 mb-4">
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
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="flex flex-row items-center justify-between input ">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="flex-1 focus:outline-none border-0 appearance-none [-webkit-text-security-:_circle] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  placeholder="Re-Enter Password"
                />
                <div onClick={() => setShowConfirmPassword((value) => !value)}>
                  {showConfirmPassword ? (
                    <PasswordHiddenEyeIcon />
                  ) : (
                    <PasswordEyeIcon />
                  )}
                </div>
              </div>
              {errors.confirmPassword?.message && (
                <ErrorInputField message={errors.confirmPassword.message} />
              )}
            </div>
          </div>
          {errors.root && (
            <div className="self-start w-full px-3 py-2 my-2 text-white bg-red-400 rounded-lg">
              {errors.root.message}
            </div>
          )}
          <Button
            type="submit"
            text="Continue"
            className="w-full"
            // disabled={!isDirty}
            // disabled={!isValid}
            // loading={isSubmitting}
          />
          <p className="text-sm font-medium mt-5 text-[#777777]">
            Already a member?{" "}
            <Link href="/login" className="text-black">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
