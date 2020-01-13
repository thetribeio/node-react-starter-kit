import {
    GraphQLNonNull as NonNull,
    GraphQLList as ListType,
    GraphQLBoolean as BooleanType,
} from 'graphql';
import { UserType } from '../types';
import { User } from '@api/models';

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
