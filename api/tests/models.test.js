import Book from '../models/Book';
import User from '../models/User';

// list of available models
const models = { Book, User };

beforeAll(() => {
    Object.entries(models).forEach(([modelName, model]) => {
        let associate = null;

        // has the model an associate method
        if (model.associate) {
            // mock the associate method
            associate = jest.fn(model.associate);
            // eslint-disable-next-line no-param-reassign
            model.associate = associate;
        }

        models[modelName] = { model, associate };
    });
});

test('All models are provided and associated through the entry point', () => {
    // get the models module
    // eslint-disable-next-line global-require
    const exportedModels = require('../models');

    Object.entries(models).forEach(([modelName, { model, associate }]) => {
        // the model must be exported
        expect(exportedModels).toHaveProperty(modelName);
        expect(exportedModels[modelName]).toBe(model);

        if (associate) {
            // the associate method must have been called once
            expect(associate.mock.calls.length).toBe(1);
        }
    });
});
