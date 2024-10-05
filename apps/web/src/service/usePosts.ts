import { CreatePostDto } from "@schema/post"
import api from "../utils/api"

// async useSubmitPost(data) {
//     return (data) => api.post("/posts", data);
// }

export const useCreatePost = async (data: CreatePostDto) => {
    return await api.post("/posts", data);
}