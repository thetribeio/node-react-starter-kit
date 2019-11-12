import usersById from './usersById';

const initializers = Object.entries({
    usersById,
});

const initLoaders = (...args) => Object.fromEntries(initializers.map(([key, init]) => [key, init(...args)]));

export default initLoaders;
