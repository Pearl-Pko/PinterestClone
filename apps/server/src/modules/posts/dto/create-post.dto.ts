import { Prisma } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDto implements Omit<Prisma.PostUncheckedCreateInput, "author_id"> {
    @IsOptional()
    title: string;
    
    @IsOptional()
    external_link?: string;
    
    @IsNotEmpty()
    image_url: string;
    
    @IsOptional()
    description?: string;
    
    @IsOptional()
    tags?: string;
    
}
