import {
    GraphQLID as IDType,
    GraphQLNonNull as NonNull,
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLBoolean as BooleanType,
} from 'graphql';
import { withErrors } from './ErrorType';

const UserType = new ObjectType({
    name: 'User',
    fields: {
        id: { type: new NonNull(IDType) },
        email: { type: new NonNull(StringType) },
        isActive: { type: new NonNull(BooleanType) },
    },
});

UserType.withErrors = withErrors(UserType);

export default UserType;
