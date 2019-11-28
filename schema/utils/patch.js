export const patchTypeFields = (type, patch) => {
    // eslint-disable-next-line no-underscore-dangle
    const getOriginalFieldMap = type._fields;

    // eslint-disable-next-line no-param-reassign, no-underscore-dangle
    type._fields = (...args) => {
        const originalFieldMap = Object.entries(getOriginalFieldMap(...args));

        return Object.fromEntries(originalFieldMap.map(([fieldName, field]) => ([
            fieldName,
            {
                ...field,
                ...patch[fieldName],
            },
        ])));
    };

    return type;
};
