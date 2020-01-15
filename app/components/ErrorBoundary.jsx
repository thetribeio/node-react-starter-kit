import * as Sentry from '@sentry/browser';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = { error: null, eventId: null };
        this.showReportDialog = this.showReportDialog.bind(this);
    }

    componentDidCatch(error, errorInfo) {
        // update the state
        this.setState({ error });

        // log the error with sentry
        Sentry.withScope((scope) => {
            scope.setExtras(errorInfo);
            const eventId = Sentry.captureException(error);
            this.setState({ eventId });
        });
    }

    showReportDialog() {
        const { eventId } = this.state;

        Sentry.showReportDialog({ eventId });
    }

    render() {
        const { error } = this.state;

        if (error) {
            // render fallback UI
            return (
                <button onClick={this.showReportDialog} type="button">Report feedback</button>
            );
        }

        const { children } = this.props;

        // when there's not an error, render children untouched
        return children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node,
};

export default ErrorBoundary;
