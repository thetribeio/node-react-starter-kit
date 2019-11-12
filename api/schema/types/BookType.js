import {
    GraphQLID as IDType,
    GraphQLNonNull as NonNull,
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
} from 'graphql';
import UserType from './UserType';

const BookType = new ObjectType({
    name: 'Book',
    fields: {
        id: { type: new NonNull(IDType) },
        title: { type: new NonNull(StringType) },
        writer: {
            type: new NonNull(UserType),
            resolve(book, args, { loaders }) {
                return loaders.usersById.load(book.writerId);
            },
        },
    },
});

export default BookType;
