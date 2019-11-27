import { BookType } from '@schema/types';
import { patchFields } from '../utils';

export default patchFields(
    BookType,
    {
        writer: {
            resolve(book, args, { loaders }) {
                return loaders.usersById.load(book.writerId);
            },
        },
    },
);
