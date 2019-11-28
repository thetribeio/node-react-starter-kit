import { BookType } from '@schema/types';
import { patchTypeFields } from '../utils';

export default patchTypeFields(
    BookType,
    {
        writer: {
            resolve(book, args, { loaders }) {
                return loaders.usersById.load(book.writerId);
            },
        },
    },
);
