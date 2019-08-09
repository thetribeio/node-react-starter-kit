import Home from './Home';

export default class Factory {
    constructor(World) {
        this.World = World;
        this.pages = {
            Home,
        };
    }

    create(name) {
        const PageClass = this.pages[name];
        if (null === PageClass) {
            throw new Error(name);
        }

        return new PageClass(this.World);
    }
}
