const proxy = require('http-proxy-middleware');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const entryPointsPathPrefix = './src';
const fakeData = require('./src/fakeData.json');
const mappingData = require('./src/mappingData.json');

const validLogin = (id, form, allData) => {
    let res = true;
    // console.log('form', form, allData);
    Object.keys(form).forEach((key) => {
        try {
            const mapKey = mappingData[id][key];
            if (allData[mapKey] && form[key] !== allData[mapKey]) {
                res = false;
            }
        } catch {
            console.error('Not a key', key);
        }
    });
    return res;
}

const proxyApi = (req, res) => {
    const path = `dist/public/${req.params.id}/logged.html`;
    if (!validLogin(req.params.id, req.query, fakeData.login)) {
        res.sendFile('dist/public/failLogin.html', { root : __dirname});
    } else {
        res.sendFile(path, { root : __dirname});
    }
}

const targets = {
    'wikijs':  'https://docs.cashstory.com',
    'filestash':  'https://files.cashstory.com',
    'healthcheck': 'https://health.cashstory.com',
    'wekan': 'https://task.cashstory.com',
    'toucan': 'https://viz.cashstory.com',
    'jupyter': 'https://datascience.cashstory.com/hub/login',
}

module.exports = env => {
    let output = {};
    let entry = {};
    let plugins = [];
    if (env && env.production) {
        entry = {
            jupyter: entryPointsPathPrefix + '/jupyter.ts',
            wikijs: entryPointsPathPrefix + '/wikijs.ts',
            wekan: entryPointsPathPrefix + '/wekan.ts',
            toucan: entryPointsPathPrefix + '/toucan.ts',
            healthcheck: entryPointsPathPrefix + '/healthcheck.ts',
            filestash: entryPointsPathPrefix + '/filestash.ts'
        };
        output = {
            path: path.resolve(__dirname, 'dist'),
            library: 'bobRpa',
            filename: '[name].js'
        };
        plugins = [
            new CopyPlugin({
                patterns: [
                { from: 'package.json', to: 'package.json' },
                ],
            })
        ];
    } else {
        entry = {
            test_parent: entryPointsPathPrefix + '/test_parent.ts',
            test_child: entryPointsPathPrefix + '/test_child.ts',
            trigger_child: entryPointsPathPrefix + '/trigger_child.ts',
            jupyter: entryPointsPathPrefix + '/jupyter.ts',
            wikijs: entryPointsPathPrefix + '/wikijs.ts',
            wekan: entryPointsPathPrefix + '/wekan.ts',
            toucan: entryPointsPathPrefix + '/toucan.ts',
            healthcheck: entryPointsPathPrefix + '/healthcheck.ts',
            filestash: entryPointsPathPrefix + '/filestash.ts'
        };
        output = {
            path: path.resolve(__dirname, 'dist'),
            publicPath: path.resolve(__dirname, 'public'),
            library: 'bobRpa',
            filename: '[name].js'
        };
        plugins = [
            new CopyPlugin({
                patterns: [
                { from: 'src/public', to: 'public' },
                { from: 'package.json', to: 'package.json' },
                ],
            }),
            new HtmlWebpackPlugin({
                template: 'src/public/index.html',
                filename: './index.html',
            })
        ];
    }
    return {
        mode: env && env.production ? 'production' : 'dev',
        watch: env && env.production ? !env.production:  false,
        devServer: {
            inline: false,
            writeToDisk: true,
            publicPath: '/',
            contentBase: path.join(__dirname, 'dist'),
            port: 9000,
            setup: function(app) {
                app.post('/api/:id/login', proxyApi);
                app.get('/api/:id/login', proxyApi);
                app.use('/iframe/:id', (req, res) => proxy.createProxyMiddleware({ target: targets[req.params.id], changeOrigin: true })(req, res));
            },
        },
        entry : entry,
        output: output,
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css', '.html'],
        },
        plugins: plugins,
        module: {
            rules: [{
                // Include ts, tsx, js, and jsx files.
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                    },
                    },
                ],
                },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            }
            ],
        }
    }
};