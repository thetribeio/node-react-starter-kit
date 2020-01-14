import PropTypes from 'prop-types';
import React from 'react';

const Html = ({ appData, manifest: { js: scripts, css: styles } }) => (
    <html lang="fr">
        <head>
            <meta charSet="utf-8" />
            <title>theTribe</title>
            <link href="favicon.png" rel="icon" type="image/png" />
            <meta content="width=device-width, initial-scale=1" name="viewport" />
            {styles.map((style) => <link key={style} href={style} rel="stylesheet" type="text/css" />)}
        </head>
        <body>
            <div data-app={JSON.stringify(appData)} id="app" />
            {scripts.map((script) => <script key={script} src={script} />)}
        </body>
    </html>
);

Html.propTypes = {
    appData: PropTypes.shape({}).isRequired,
    manifest: PropTypes.shape({
        css: PropTypes.arrayOf(PropTypes.string).isRequired,
        js: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
};

export default Html;
