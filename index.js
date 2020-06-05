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
        reject(error);
    });

    server.setTimeout(timeout);
    server.maxConnections = maxConnections || Infinity;
    server.keepAliveTimeout = keepAliveTimeout;

    app.set('server', server);
}

function setExpressAppProperties(resolver, facet, wire) {
    const app = facet.target;
    wire(facet.options).then(props => {
        props.forEach(({ name, reference }) => app.set(name, reference));
        resolver.resolve();
    });
}

function createApplication({ resolve }, compDef, wire) {
    if (!compDef.options) {
        throw new Error('Please set true value to create Express application.');
    }

    wire(compDef.options).then(({
        useMiddlewares
    }) => {
        const app = express();
        if(Array.isArray(useMiddlewares)) useMiddlewares.forEach(middleware => app.use(middleware));
        resolve(app);
    });
}

module.exports = function expressAppPlugin(options) {
    return {
        factories: {
            createApplication
        },
        facets: {
            server: {
                ready: startServerFacet
            },
            setExpressAppProperties: {
                'initialize:before': setExpressAppProperties
            }
        }
    }
}
