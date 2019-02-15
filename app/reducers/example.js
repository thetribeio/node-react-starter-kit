const initialState = {};

const reducer = (state = initialState, { type, ...payload }) => {
    switch (type) {
        case 'EXAMPLE_SET_VALUE':
            return { ...state, [payload.key]: payload.value };
        default:
            return state;
    }
};

export default reducer;
