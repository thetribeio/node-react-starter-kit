import {
    GraphQLNonNull as NonNull,
    GraphQLList as ListType,
} from 'graphql';
import { Book } from '@api/models';
import { BookType } from '../types';

export default {
    type: new NonNull(new ListType(new NonNull(BookType))),
    resolve: () => Book.findAll(),
};
