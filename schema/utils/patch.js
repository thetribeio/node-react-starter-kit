export const patchTypeFields = (type, patch) => {
    // eslint-disable-next-line no-underscore-dangle
    const getOriginalFieldMap = type._fields;

    // eslint-disable-next-line no-param-reassign, no-underscore-dangle
    type._fields = () => {
        const originalFieldMap = Object.entries(getOriginalFieldMap());

        return Object.fromEntries(originalFieldMap.map(([fieldName, field]) => ({
            ...field,
            ...patch[fieldName],
        })));
    };

    return type;
};
