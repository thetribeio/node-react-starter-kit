import {
    GraphQLNonNull as NonNull,
    GraphQLList as ListType,
    GraphQLBoolean as BooleanType,
} from 'graphql';
import { User } from '@api/models';
import { UserType } from '../types';

export default {
    type: new NonNull(new ListType(new NonNull(UserType))),
    args: {
        onlyActive: { type: BooleanType },
    },
    resolve: (request, { onlyActive = false }) => {
        if (onlyActive) {
            return User.findAll({ where: { isActive: true } });
        }

        return User.findAll();
    },
};
