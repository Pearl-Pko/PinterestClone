import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PasswordEyeIcon, PasswordHiddenEyeIcon } from "@web/public";
import Button from "@web/src/components/common/Button";
import ErrorInputField from "@web/src/components/common/ErrorInputField";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@web/src/components/ui/dialog";
import { useToast } from "@web/src/hooks/use-toast";
import { SetPasswordDtoWithConfirmation } from "@web/src/schema/user";
import { useSetPassword } from "@web/src/service/useUser";
import { AxiosError } from "axios";
import { error } from "console";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function SetPassword({
  open,
  setOpen,
  fn,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  fn?: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, mutateAsync: setPassword } = useMutation({
    mutationFn: useSetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    clearErrors,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<SetPasswordDtoWithConfirmation>({
    resolver: classValidatorResolver(SetPasswordDtoWithConfirmation),
    reValidateMode: "onChange",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  console.log("pass", errors.password);
  const submitForm = async (data: SetPasswordDtoWithConfirmation) => {
    try {
      await setPassword(data);
      await fn?.();
      toast({
        description:
          "Password has been set and provider has been unlinked successfully",
      });
      setOpen(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: "destructive",
          description: error.response?.data.message,
        });
      }

      console.error(error);
    }
  };

  useEffect(() => {
    if (!open) {
      reset();
      clearErrors();
    }
  }, [open]);



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[600px]">
        <form
          className="flex flex-col gap-8 items-stretch "
          onSubmit={handleSubmit(submitForm)}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl text-center">
              Create a password
            </DialogTitle>
            <DialogDescription className="text-center text-black">
              You need to create a password before you unlink your Pinkterest
              account from your social login
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-col w-5/6 gap-2">
              <label htmlFor="password" className="text-sm">
                New password
              </label>
              <div className="flex flex-row items-center justify-between input ">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="flex-1 focus:outline-none border-0 appearance-none [-webkit-text-security-:_circle] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
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
            <div className="flex flex-col w-5/6 gap-2">
              <label htmlFor="confirmPassword" className="text-sm">
                Type it again
              </label>
              <div className="flex flex-row items-center justify-between input ">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="flex-1 focus:outline-none border-0 appearance-none [-webkit-text-security-:_circle] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
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
          <div className="flex flex-row justify-end gap-2 w-full">
            <Button
              // className="flex-1"
              text="Cancel"
              variant="secondary"
              onClick={() => setOpen(false)}
            />
            <Button
              variant="primary"
              disabled={!isValid || isSubmitting}
              text="Save"
              type="submit"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
