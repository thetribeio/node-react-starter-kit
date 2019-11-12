import {
    GraphQLID as IDType,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
} from 'graphql';
import { Book } from '@api/models';
import { BookType } from '../types';

export default {
    args: {
        writerId: { type: new NonNull(IDType) },
        title: { type: new NonNull(StringType) },
    },
    type: new NonNull(BookType),
    resolve: (request, args) => Book.create(args),
};
