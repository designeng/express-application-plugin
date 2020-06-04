const expressAppPlugin = require('../index');
const wire = require('wire');
const expect = require('chai').expect;
const axios = require('axios');

const HOST = 'localhost';
const PORT = 3000;
const BASE_TIMEOUT = 30000;

let context, active;

const useMiddlewares = [
    function activate(req, res, next) {
        active = true;
        next();
    }
];

const spec = {
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
    },

    routeSystem: {
        create: {
            module: function(app) {
                app.get('/user', function(req, res) {
                    res.status(200).json({ name: 'admin' });
                });
            },
            args: [
                {$ref: 'app'}
            ]
        }
    }
}

before(async () => {
    try {
        context = await wire(spec);
    } catch (err) {
        console.log('Wiring error', err);
    }
});

describe('Express app', () => {
    it('should be created', () => {
        expect(context.app).to.be.ok;
    });

    it('should response on route request', async () => {
        const result = await axios({
            url: `http://${HOST}:${PORT}/user`,
            method: 'get'
        });
        expect(result.data.name).to.equal('admin');
    });

    it('should invoke middleware', () => {
        expect(active).to.be.ok;
    });
});

after(async () => {
    const app = context.app;
    const server = app.get('server');
    server.close();
    context.destroy();
});
