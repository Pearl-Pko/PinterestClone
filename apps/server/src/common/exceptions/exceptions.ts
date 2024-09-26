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

export class UserWithEmailNotFoundException extends HttpException {
    constructor(email: string) {
        super(
            `User with email ${email} does not exist`,
            HttpStatus.NOT_FOUND
        )
    }
}

export class UserWithUsernameNotFoundException extends HttpException {
    constructor(email: string) {
        super(
            `User with email ${email} does not exist`,
            HttpStatus.NOT_FOUND
        )
    }
}


export class UserWithIdNotFoundException extends HttpException {
    constructor(id: string) {
        super(
            `User with id ${id} does not exist`,
            HttpStatus.NOT_FOUND
        )
    }
}


export class SessionNotFoundException extends HttpException {
    constructor(email: string) {
        super(
            `Session not found`,
            HttpStatus.NOT_FOUND
        )
    }
}
