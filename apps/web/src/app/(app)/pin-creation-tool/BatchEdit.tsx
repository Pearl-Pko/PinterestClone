import React, { useEffect, useState } from "react";
import { CloseIcon } from "@web/public";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetTrigger,
  SheetClose,
  SheetFooter,
  SheetDescription,
} from "@web/src/components/ui/sheet";
import PostForm from "./PostForm";
import { FormProvider, useForm } from "react-hook-form";
import { CreatePostWebDto } from "@web/src/schema/post";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import Button from "@web/src/components/common/Button";
import { BatchEditPosts } from "@schema/post";
import { differenceInCalendarISOWeekYears } from "date-fns";
import { useBatchEditPosts } from "@web/src/service/usePosts";
import { useQueryClient } from "@tanstack/react-query";

export default function BatchEdit({
  selectedPosts,
  onOpenChange,
  open,
  currentPost,
}: {
  selectedPosts: string[];
  open: boolean;
  currentPost: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(open);
  const queryClient = useQueryClient();

  const form = useForm<BatchEditPosts>({
    resolver: classValidatorResolver(BatchEditPosts, {
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
    mode: "onChange",
  });

  const onSubmit = async (data: BatchEditPosts) => {
    try {
      await useBatchEditPosts({...data, postIds: selectedPosts});
      queryClient.invalidateQueries({ queryKey: ["post", currentPost] });
      queryClient.invalidateQueries({ queryKey: ["getAllPosts", "draft"] });
      setIsOpen(false);
      onOpenChange(false);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    form.reset();
  }, [isOpen])
  
  return (
    <FormProvider {...form}>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          className="h-full flex flex-col w-2/5 py-8 px-0"
          side="right"
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
            <SheetHeader className="flex flex-row justify-between w-full px-6">
              <SheetTitle className="text-2xl">
                Edit Pins ({selectedPosts.length})
              </SheetTitle>
              <SheetClose>
                <CloseIcon />
              </SheetClose>
            </SheetHeader>

            <div className="py-8 overflow-y-auto flex-1">
              <div className="px-6 flex flex-col gap-5">
                <PostForm />
              </div>
            </div>
            <SheetFooter className="px-6">
              <Button text="Update" disabled={!form.formState.isDirty}/>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </FormProvider>
  );
}
