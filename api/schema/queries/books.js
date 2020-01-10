import {
    GraphQLNonNull as NonNull,
    GraphQLList as ListType,
} from 'graphql';
import { BookType } from '../types';
import { Book } from '@api/models';

export default {
    type: new NonNull(new ListType(new NonNull(BookType))),
    resolve: () => Book.findAll(),
};
