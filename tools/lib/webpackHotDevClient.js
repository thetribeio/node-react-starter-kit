import hotClient from 'webpack-hot-middleware/client';
import launchEditorEndpoint from 'react-dev-utils/launchEditorEndpoint';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import {
    setEditorHandler,
    reportBuildError,
    dismissBuildError,
    startReportingRuntimeErrors,
    stopReportingRuntimeErrors,
} from 'react-error-overlay';

setEditorHandler((errorLocation) => {
    const fileName = encodeURIComponent(errorLocation.fileName);
    const lineNumber = encodeURIComponent(errorLocation.lineNumber || 1);

    // Keep in sync with react-dev-utils/errorOverlayMiddleware
    // eslint-disable-next-line no-undef
    fetch(`${launchEditorEndpoint}?fileName=${fileName}&lineNumber=${lineNumber}`);
});

hotClient.useCustomOverlay({
    showProblems(type, errors) {
        reportBuildError(formatWebpackMessages({ errors, warnings: [] }).errors[0]);
    },
    clear() {
        dismissBuildError();
    },
});

hotClient.setOptionsAndConnect({ name: 'client', reload: true });

startReportingRuntimeErrors({ filename: '/assets/client.js' });

if (module.hot) {
    module.hot.dispose(stopReportingRuntimeErrors);
}
