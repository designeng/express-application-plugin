const express = require('express');

function isFunction(f) {
    return f && {}.toString.call(f) === '[object Function]';
}

function startServerFacet({ resolve, reject }, facet, wire) {
    const {
        port,
        host,
        timeout,
        keepAliveTimeout,
        maxConnections,
        successCallback,
        errorCallback
    } = facet.options;

    const app = facet.target;

    const http = require('http').createServer(app);

    const server = http.listen(port, host, async () => {
        if(isFunction(successCallback)) await successCallback();
        resolve(app);
    }).on('error', async (error) => {
        if(isFunction(errorCallback)) await errorCallback(error);
        reject(err);
    });

    server.setTimeout(timeout);
    server.maxConnections = maxConnections || Infinity;
    server.keepAliveTimeout = keepAliveTimeout;

    app.set('server', server);
}

function createApplication({ resolve }, compDef, wire) {
    if (!compDef.options) {
        throw new Error('Please set true value to create Express application.');
    }

    wire(compDef.options).then(({
        useMiddlewares
    }) => {
        const app = express();
        useMiddlewares.forEach(middleware => app.use(middleware));
        resolve(app);
    });
}

module.exports = function ExpressAppPlugin(options) {
    return {
        factories: {
            createApplication
        },
        facets: {
            server: {
                ready: startServerFacet
            }
        }
    }
}
