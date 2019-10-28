import PropTypes from 'prop-types';
import React from 'react';
import serialize from 'serialize-javascript';

const Html = ({ appData, manifest: { js: scripts, css: styles }, children, state }) => (
    <html lang="fr">
        <head>
            <meta charSet="utf-8" />
            <title>theTribe</title>
            <link rel="icon" type="image/png" href="favicon.png" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            {styles.map((style) => <link rel="stylesheet" type="text/css" href={style} key={style} />)}
        </head>
        <body>
            <div id="app" data-app={JSON.stringify(appData)} dangerouslySetInnerHTML={{ __html: children }} />
            <script
                dangerouslySetInnerHTML={{ __html: `window.State=${serialize(state)}` }}
            />
            {scripts.map((script) => <script src={script} key={script} />)}
        </body>
    </html>
);

Html.propTypes = {
    children: PropTypes.string.isRequired,
    appData: PropTypes.shape({}).isRequired,
    manifest: PropTypes.shape({
        js: PropTypes.arrayOf(PropTypes.string).isRequired,
        css: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    state: PropTypes.shape({}).isRequired,
};

export default Html;
