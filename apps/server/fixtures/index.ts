import { OmitType } from "@nestjs/mapped-types";
import { CreatePostDto } from "@server/modules/posts/dto/create-post.dto";
import { UpdatePostDto } from "@server/modules/posts/dto/update-post.dto";
import { CreateUserDto } from "@server/modules/users/dto/create-user.dto";



export const POST:  Omit<CreatePostDto, "author_id">  = {
    title: "Test post", 
    image_url: 'https://example.com/image.jpg',
}