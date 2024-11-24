import { AxiosResponse } from "axios";
import { CreatePostWebDto } from "../schema/post";
import api from "../utils/api";
import { PostEntity } from "@schema/post";

// async useSubmitPost(data) {
//     return (data) => api.post("/posts", data);
// }

export const useCreatePost = async (data: FormData) => {
  return await api.post("/posts", data) as AxiosResponse<PostEntity>;
};

export const useDeletePost = async (id: string) => {
  return await api.delete(`/posts/${id}`);
}

export const useUpdatePost = async ({id, data} : {id: string, data: FormData}) => {
  return await api.patch(`/posts/${id}`, data)
}

export const usePublishPost = async (id: string) => {
  return await api.patch(`/posts/${id}/publish`)
}