import {
    GraphQLID as IDType,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
} from 'graphql';
import { BookType } from '../types';
import { transformSequelizeErrors, withHandledErrors, withMiddlewares } from '../utils';
import { Book } from '@api/models';

export default {
    args: {
        writerId: { type: new NonNull(IDType) },
        title: { type: new NonNull(StringType) },
    },
    type: new NonNull(BookType),
    resolve: withMiddlewares(
        withHandledErrors,
        transformSequelizeErrors,
        (request, args) => Book.create(args),
    ),
};
