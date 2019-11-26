import {
    GraphQLID as IDType,
    GraphQLNonNull as NonNull,
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLList as ListType,
    GraphQLBoolean as BooleanType,
} from 'graphql';
import { HandledError } from '../utils/errors';

const ErrorType = new ObjectType({
    name: 'Error',
    fields: {
        code: { type: IDType },
        path: { type: StringType },
        message: { type: new NonNull(StringType) },
    },
});

export const withErrors = (OutputType, { typeName = null, outputField = 'data' } = {}) => {
    const name = typeName || `${OutputType.name}WithErrors`;

    return new ObjectType({
        name,
        fields: {
            isSuccessful: {
                type: new NonNull(BooleanType),
                resolve: (root) => !(root instanceof HandledError),
            },
            [outputField]: {
                type: OutputType,
                resolve: (root) => (root instanceof HandledError ? null : root),
            },
            errors: {
                type: new ListType(new NonNull(ErrorType)),
                resolve: (root) => (root instanceof HandledError ? root.errors : null),
            },
        },
    });
};

export default ErrorType;
