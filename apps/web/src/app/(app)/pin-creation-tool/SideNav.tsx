import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CloseSideNavIcon,
  DeleteIcon,
  OpenSideNavIcon,
  ResetPinIcon,
  SimpleEditIcon,
} from "@web/public";
import { Checkbox } from "@web/src/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@web/src/components/ui/popover";
import {
  useBatchDeletePosts,
  useBatchPublishPosts,
  useDeletePost,
  useDuplicatePost,
  useGetAllUserPosts,
} from "@web/src/service/usePosts";
import clsx from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { EditIcon, Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";
import { PopoverClose } from "@radix-ui/react-popover";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Button from "@web/src/components/common/Button";
import Icon from "@web/src/components/common/Icon";
import { Drawer, DrawerContent } from "@web/src/components/ui/drawer";
import BatchEdit from "./BatchEdit";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@web/src/components/ui/dialog";

export default function SideNav({
  onSelectPost,
  selectedPostId,
}: {
  onSelectPost: (postId: string) => void;
  selectedPostId: string;
}) {
  const [open, setOpen] = useState(true);

  const [batchPostDrawerOpen, setBatchPostDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [singleItemDelete, setSingleItemDelete] = useState<string>("");
  const [selectAllCheckbox, setSelectAllCheckBox] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ["getAllPosts", "draft"],
    queryFn: () => useGetAllUserPosts("draft"),
  });
  const queryClient = useQueryClient();

  const [checkedPosts, setCheckedPosts] = useState<string[]>([]);

  const completeBatchOperation = (postIds: string[]) => {
    queryClient.invalidateQueries({ queryKey: ["getAllPosts", "draft"] });
    if (postIds.includes(selectedPostId)) {
      onSelectPost("");
    }
    setCheckedPosts([]);
  };

  const batchPublishPosts = useMutation({
    mutationFn: useBatchPublishPosts,
    onSuccess: (data, variables) => {
      completeBatchOperation(variables.postIds);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: useDeletePost,
    onSuccess: (data, variables) => {
      if (selectedPostId == variables) {
        onSelectPost("");
      }
      setCheckedPosts(checkedPosts.filter((post) => post != variables));
      queryClient.invalidateQueries({ queryKey: ["getAllPosts", "draft"] });
    },
  });
  const duplicateMutation = useMutation({
    mutationFn: useDuplicatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllPosts", "draft"] });
    },
  });

  const batchDeleteOperation = useMutation({
    mutationFn: useBatchDeletePosts,
    onSuccess: (data, variables) => {
      completeBatchOperation(variables.postIds);
    },
  });

  const drafts = data?.data.data;

  useEffect(() => {
    if (checkedPosts.length > 0) setSelectAllCheckBox(true);
    else setSelectAllCheckBox(false)
  }, [checkedPosts]);

  // console.log("drafts", drafts);
  console.log("checked posts", checkedPosts);

  return (
    <div
      className={clsx(
        "flex gap-12  border-r-0 flex-col h-full",
        open && "w-[330px]",
        !open && "p-3 border-2",
      )}
    >
      {!open && (
        <div className="flex flex-col gap-5">
          <Icon
            icon={<OpenSideNavIcon />}
            onClick={() => {
              setOpen(true);
            }}
            className="p-3"
          />
          <Icon
            icon={<ResetPinIcon />}
            onClick={() => {
              // onCreateNewPost();
              onSelectPost("");
            }}
            className="p-3"
          />
        </div>
      )}
      {open && (
        <div className="flex flex-col flex-1 h-full">
          <div className="flex flex-col gap-6 p-5 border-2 border-r-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="text-xl font-semibold ">Pin drafts</p>
                <p className="text-xl">({data?.data.totalCount})</p>
              </div>
              <Icon
                icon={<CloseSideNavIcon />}
                className="p-3"
                onClick={() => {
                  setOpen(false);
                }}
              />
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
                    <Checkbox
                      checked={checkedPosts.includes(draft.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCheckedPosts((prev) => [...prev, draft.id]);
                        } else {
                          setCheckedPosts(
                            checkedPosts.filter((value) => value != draft.id),
                          );
                        }
                      }}
                    />
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
                      <Icon icon={<Ellipsis />} className="hover:bg-gray-300" />
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
                          setSingleItemDelete(draft.id);
                          setDialogOpen(true);
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
          <div className="flex flex-row items-center p-5 border-t-2 justify-between">
            <div className="flex flex-row items-center gap-2">
              <Checkbox
                className="w-5 h-5"
                checked={selectAllCheckbox}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCheckedPosts(drafts?.map((item) => item.id) || []);
                    setSelectAllCheckBox(true);
                  } else {
                    setCheckedPosts([]);
                    setSelectAllCheckBox(false);
                  }
                }}
              />
              {checkedPosts.length == 0 ? (
                <p>Select All</p>
              ) : (
                <p>
                  {checkedPosts.length} of {data?.data.totalCount}
                </p>
              )}
            </div>
            {checkedPosts.length > 0 && (
              <div className="flex flex-row items-center gap-2">
                <Icon
                  icon={<DeleteIcon />}
                  onClick={() => setDialogOpen(true)}
                />
                <Icon
                  icon={<SimpleEditIcon />}
                  onClick={() => {
                    setBatchPostDrawerOpen(true);
                  }}
                />
                <Button
                  text="Publish"
                  className="px-3 py-1"
                  onClick={() =>
                    batchPublishPosts.mutate({ postIds: checkedPosts })
                  }
                />
              </div>
            )}
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="flex flex-col gap-11 items-center w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-3xl">
                  Delete your draft?
                </DialogTitle>
              </DialogHeader>
              <p className="text-center">
                You'll lose edits you have made. This can't be undone
              </p>
              <div className="flex flex-row justify-between gap-2 w-full">
                <Button
                  className="flex-1"
                  text="Keep editing"
                  variant="secondary"
                  onClick={() => setDialogOpen(false)}
                />
                <Button
                  className="flex-1"
                  text="Delete"
                  onClick={() => {
                    if (singleItemDelete) {
                      deleteMutation.mutate(singleItemDelete);
                      setSingleItemDelete("");
                    } else
                      batchDeleteOperation.mutate({
                        postIds: checkedPosts,
                      });
                    setDialogOpen(false);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <BatchEdit
        currentPost={selectedPostId}
        open={batchPostDrawerOpen}
        selectedPosts={checkedPosts}
        onOpenChange={(open) => setBatchPostDrawerOpen(open)}
      />
    </div>
  );
}
