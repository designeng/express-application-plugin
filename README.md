## Express.js plugin for wire.js

## Installation
`npm i express-application-plugin`

## Usage
`express.app.spec.js`
```
import expressAppPlugin from 'express-application-plugin';

const { HOST, PORT } = process.env;
const BASE_TIMEOUT = 30000;

export default {
    $plugins: [
        expressAppPlugin
    ],

    app: {
        createApplication: {
            useMiddlewares
        },
        server: {
            port: PORT,
            host: HOST,
            timeout: BASE_TIMEOUT,
            keepAliveTimeout: BASE_TIMEOUT + 5000,
            successCallback: function () {
                console.info(`Express app is listening at http://%s:%s, pid: %s`, HOST, PORT, process.pid);
            },
            errorCallback: function (error) {
                /* do smth with error, trace to log e.g. */
            }
        },
    }
}
```
Install wire from `git://github.com/cujojs/wire.git#0.10.11`
main.js:
```
import wire from 'wire';
import expressAppSpec from './express.app.spec.js';

wire(expressAppSpec).then(context => {
    let { app } = context;

    /* do smth additional with app */
})
```
