![StarterKitBanner](app/images/StarterKitTheTribe.png)

## Overview

This repository contains the source code for Node-React-Starter-Kit made by theTribe.io developpers team.
The starter kit is built on top of Node.js, Express, React and Redux, containing modern web development tools such as Webpack and Babel.

A solid starting point for both professionals and newcomers to the industry.

|**Front-end tools**|**Back-end tools**|**Functional Testing**|**Dev Environment Configuration**|
|---|---|---|---|
|React|Express|Selenium|Docker|
|Redux|Postgresql|Cucumber.js|
|CSS/SCSS|Sequelize|Saucelabs|

## Customization

The `master` branch of the starter kit does not include advanced integrations.
However we do provide variants that you can use as a reference.

* [variant/graphql](https://github.com/thetribeio/node-react-starter-kit/tree/variant/graphql) : 
Provide an [GraphQL][gql] API running with [apollo][apollo] client. 
* [variant/ssr-graphql](https://github.com/thetribeio/node-react-starter-kit/tree/variant/ssr-graphql) : 
Provide server side rendering support with a [GraphQL][gql] API running with [apollo][apollo] client.

[gql]: https://graphql.org
[apollo]: https://www.apollographql.com/docs/react/

## Getting Started

### Installation

#### start the app

To run locally the project you should first install the dependencies

```bash
# for local environment
yarn install
yarn start

# for docker environment
docker-compose up -d
docker-compose stop app
docker-compose run --rm app yarn install
docker-compose run --rm app sequelize db:migrate
docker-compose start app
```

You may create a file `docker-compose.override.yml` at the root to override your configuration.
Most likely you might be interested in opening a port on the host, or use your yarn cache in docker containers.

```yaml
version: '2.4'
services:
  app:
    volumes:
      - ~/.cache/yarn:/home/app/.cache/yarn:rw
    ports:
      - 3000:3000
```


## Configure your user id

The containers are configured tu run with an user with ID 1000 to remove permissions problems, but if your user ID is
not 1000 you will need to configure the images to use your user ID.

You can get the your user ID by running `id -u`

If your user ID is not 1000 you will need to add the following config to your `.env`

```
UID=YourUID
```

And then run `docker-compose build` to rebuild your containers.

### run the linter on your code

```bash
# run locally
yarn lint

# run in docker
docker-compose run --rm app lint
```

### build the app

```bash
# to build locally
yarn build

# to build a production image (docker)
docker build -f .production/Dockerfile -t [image:tag] .
```

### Run the production image locally

You might try to run the production image locally with `docker-compose`, to do so, simply create a new directory anywhere and use the following configuration.

```yaml
version: '2.0'
services:
    app:
        # use the right tag
        image: [image:tag]
        environment:
            DATABASE_HOST: postgres
            DATABASE_NAME: thetribe
            DATABASE_USER: thetribe
            DATABASE_PASSWORD: 424242
            # set the env as you need it
        depends_on:
            - postgres
        ports:
            - 3000:3000
    postgres:
        image: postgres:10.7
        environment:
            POSTGRES_USER: thetribe
            POSTGRES_PASSWORD: 424242
```

### Watch options

You may provide watch options for the compiler simply by writing a file named `watchOptions.config.js` at the root directory.

```js
module.exports = {
    // Watching may not work with NFS and machines in VirtualBox
    // Uncomment next line if it is your case (use true or interval in milliseconds)
    // poll: true,
    // Decrease CPU or memory usage in some file systems
    // ignored: /node_modules/,
};
```

### Global & module style sheets

You may import style sheets two ways in your app.
Firstly, if you important a style sheets from the directories `app/components` or `app/routes`,
your style will be imported as a module.
It means you have to import it and manipulate it that way ;

```js
// import it as a module
import style from './style.css';

// and use it that way
<div className={style.myDiv} />
```

However if you import a style sheet from elsewhere (node modules or another location in your sources),
it wil be imported as a global. It means you have to import it that way ;

```js
import './style.css';
```

You may either import CSS style sheets or SASS stylesheet (using the extension `.scss`).

### Inject settings to frontend (appData)

The backend renders the HTML entry point for your application.
By doing so, it allows you to inject settings into your frontend application.

First you've to push your data into an object on your server side.

```js
// api/index.js
const appData = {
    /* ... */
    myInjectedSettings: 42,
    /* ... */
};
```

Then you may get those injected settings anywhere in your react scope.
You may either use a `custom hook`.

```js
import { useAppData } from '@app/App';

const MyComponent = () => {
    const { myInjectedSettings } = useAppData();

    /* ... */
};
```

Or use the `context consumer` directly.

```js
import { AppDataContext } from '@app/App';

class MyComponent extends Component {
    render() {
        const { myInjectedSettings } = this.context;

        /* ... */
    }
}

MyComponent.contextType = AppDataContext;
```

The injected settings (we call here `appData`) are also available in `thunk reducers`

```js
const asyncActionCreator = () => (dispatch, getState, { appData }) => {
    const { myInjectedSettings } = appData;

    /* ... */
};
```
