import {
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
} from 'graphql';
import bcrypt from 'bcrypt';
import { User } from '@api/models';
import { UserType } from '../types';

export default {
    args: {
        email: { type: new NonNull(StringType) },
        password: { type: new NonNull(StringType) },
    },
    type: new NonNull(UserType),
    resolve: async (request, { password, ...args }) => User.create({
        ...args,
        password: await bcrypt.hash(password, 8),
    }),
};
