import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthorNotFoundException extends HttpException {
    constructor(authorId: string) {
        super(
            `Author with id '${authorId}' does not exist`,
            HttpStatus.NOT_FOUND,
        );
    }
}
