import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    // Override handleRequest so that it doesn't throw an exception if the user is not logged in
    handleRequest(err, user, info) {
        return user || null;
    }
}
