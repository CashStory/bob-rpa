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
    'filestash':  'https://files.cashstory.com',
    'healthcheck': 'https://health.cashstory.com',
    'wekan': 'https://task.cashstory.com',
    'toucan': 'https://viz.cashstory.com',
    'jupyter': 'https://datascience.cashstory.com/hub/login',
}

module.exports = env => {
    return {
            mode: 'production',
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
    entry : {
        test_parent: entryPointsPathPrefix + '/test_parent.ts',
        test_child: entryPointsPathPrefix + '/test_child.ts',
        trigger_child: entryPointsPathPrefix + '/trigger_child.ts',
        jupyter: entryPointsPathPrefix + '/jupyter.ts',
        wekan: entryPointsPathPrefix + '/wekan.ts',
        toucan: entryPointsPathPrefix + '/toucan.ts',
        healthcheck: entryPointsPathPrefix + '/healthcheck.ts',
        filestash: entryPointsPathPrefix + '/filestash.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: path.resolve(__dirname, 'public'),
        library: 'bobRpa',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json', '.css', '.html'],
    },
    plugins: [
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
    ],
    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        },
        // {
        //     test: /\.css$/i,
        //     loader: ['to-string-loader', 'css-loader'],
        // },
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        },
        // {
        //     test: /\.css$/i,
        //     loader: 'css-loader',
        //     options: {
        //         modules: true
        //     }
        // },
        // {
        //     test: /\.css$/i,
        //     use: [
        //       'handlebars-loader', // handlebars loader expects raw resource string
        //       'extract-loader',
        //       'to-string-loader',
        //       'css-loader',
        //     ],
        // },
        {
            test: /\.html$/i,
            loader: 'html-loader',
        }
        ],
    }
}
};