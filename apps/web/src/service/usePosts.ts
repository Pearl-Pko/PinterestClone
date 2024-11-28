import { AxiosResponse } from "axios";
import { CreatePostWebDto } from "../schema/post";
import api from "../utils/api";
import { BatchEditPosts, PostEntity } from "@schema/post";
import { PostStatus } from '@prisma/client';
import { PaginatedQuery, PaginatedResponse } from "@schema/util";


// async useSubmitPost(data) {
//     return (data) => api.post("/posts", data);
// }

export const useGetPost = async (id: string) => {
  return (await api.get(`/posts/${id}`)).data as PostEntity
}

export const useCreatePost = async (data: FormData) => {
  return await api.post("/posts", data) as AxiosResponse<PostEntity>;
};

export const useDeletePost = async (id: string) => {
  return await api.delete(`/posts/${id}`);
}

export const useUpdatePost = async ({id, data} : {id: string, data: FormData}) => {
  return await api.patch(`/posts/${id}`, data)
}

export const useDuplicatePost = async (id: string) => {
  return await api.post(`/posts/${id}/duplicate`)
}

export const usePublishPost = async (id: string) => {
  return await api.patch(`/posts/${id}/publish`)
}

export const useGetAllPostsForAUser = async (userId: string) => {
  return await api.get(`/posts?userId=${userId}`)
}

export const useGetAllUserPosts = async (status: PostStatus) => {
  return await api.get(`/posts?status=${status}`) as AxiosResponse<PaginatedResponse<PostEntity>>;
}

export const useBatchEditPosts = async (data: BatchEditPosts) => {
  return await api.patch(`/posts/batch-edit`, data)
}

