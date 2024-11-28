import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CloseSideNavIcon, OpenSideNavIcon, ResetPinIcon } from "@web/public";
import { Checkbox } from "@web/src/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@web/src/components/ui/popover";
import {
  useDeletePost,
  useDuplicatePost,
  useGetAllUserPosts,
} from "@web/src/service/usePosts";
import clsx from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { PopoverClose } from "@radix-ui/react-popover";

export default function SideNav({
  onSelectPost,
  selectedPostId,
}: {
  onSelectPost: (postId: string) => void;
  selectedPostId: string;
}) {
  const [open, setOpen] = useState(true);
  const { data } = useQuery({
    queryKey: ["getAllPosts", "draft"],
    queryFn: () => useGetAllUserPosts("draft"),
  });
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: useDeletePost,
    onSuccess: (data, variables) => {
      if (selectedPostId == variables) {
        onSelectPost("");
      }
      queryClient.invalidateQueries({ queryKey: ["getAllPosts", "draft"] });
    },
  });
  const duplicateMutation = useMutation({
    mutationFn: useDuplicatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllPosts", "draft"] });
    },
  });

  const drafts = data?.data.data;

  console.log("drafts", drafts);

  return (
    <div
      className={clsx(
        "flex gap-12  border-r-0 flex-col h-full",
        open && "w-[330px]",
        !open && "p-7 border-2",
      )}
    >
      {!open && (
        <>
          <button
            onClick={() => {
              setOpen(true);
            }}
          >
            <OpenSideNavIcon />
          </button>
          <button
            onClick={() => {
              // onCreateNewPost();
              onSelectPost("");
            }}
          >
            <ResetPinIcon />
          </button>
        </>
      )}
      {open && (
        <div className="flex flex-col flex-1 h-full">
          <div className="flex flex-col gap-6 p-5 border-2 border-r-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="text-xl font-semibold ">Pin drafts</p>
                <p className="text-xl">({data?.data.totalCount})</p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                }}
              >
                <CloseSideNavIcon />
              </button>
            </div>
            <button
              className="w-full py-2 font-semibold bg-gray-200 rounded-full"
              onClick={() => onSelectPost("")}
            >
              Create new
            </button>
          </div>
          <div className="flex flex-col flex-1 gap-4 p-2 h-full overflow-y-auto">
            {drafts?.map((draft) => {
              return (
                <div
                  key={draft.id}
                  className={clsx(
                    "flex justify-between items-center hover:bg-gray-200 p-2 rounded-md cursor-pointer",
                    draft.id === selectedPostId &&
                      "bg-gray-200 border border-black",
                  )}
                  onClick={() => onSelectPost(draft.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox />
                    <div className="w-20 h-20 overflow-hidden rounded-xl">
                      <img
                        src={draft.content_uri}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{draft.title}</p>
                      {draft?.expiresAt && (
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNowStrict(draft.expiresAt)} until
                          expiry
                        </p>
                      )}
                    </div>
                  </div>
                  <Popover>
                    <PopoverTrigger>
                      <div className="hover:bg-gray-300 rounded-full p-1">
                        <Ellipsis />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col w-auto px-2 gap-1 py-2 rounded-xl">
                      <PopoverClose
                        className="hover:bg-gray-200 px-3 py-2 font-semibold rounded-lg text-left"
                        onClick={() => {
                          duplicateMutation.mutate(draft.id);
                        }}
                      >
                        Duplicate
                      </PopoverClose>
                      <PopoverClose
                        className="hover:bg-gray-200 px-3 py-2 font-semibold rounded-lg text-left"
                        onClick={() => {
                          deleteMutation.mutate(draft.id);
                        }}
                      >
                        Delete
                      </PopoverClose>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}
          </div>
          <div className="flex flex-row items-center gap-2 p-5 border-t-2">
            <Checkbox className="w-5 h-5" />
            <p>Select All</p>
          </div>
        </div>
      )}
    </div>
  );
}
