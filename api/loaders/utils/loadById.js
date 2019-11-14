import DataLoader from 'dataloader';
import { Op } from 'sequelize';

const loadById = (model) => () => {
    const batchLoader = async (ids) => {
        const instances = await model.findAll({ where: { id: { [Op.in]: ids } } });
        const idMap = Object.fromEntries(instances.map((instance) => [instance.id, instance]));

        return ids.map((id) => idMap[id]);
    };

    return new DataLoader(batchLoader);
};

export default loadById;
