import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthorNotFoundException extends HttpException {
    constructor(authorId: string) {
        super(
            `Author with id '${authorId}' does not exist`,
            HttpStatus.NOT_FOUND,
        );
    }
}

export class UserAlreadyExists extends HttpException {
    constructor() {
        super(
            "User already exists",
            HttpStatus.BAD_REQUEST
        )
    }
}

export class UserNotFoundException extends HttpException {
    constructor(email: string) {
        super(
            `User with email ${email} does not exist`,
            HttpStatus.NOT_FOUND
        )
    }
}
