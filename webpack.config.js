const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const entryPointsPathPrefix = './src';

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
        proxy: {
            '/filestash_remote': {
                target: 'http://files.cashstory.com'
            },
            '/healthcheck_remote': {
                target: 'http://health.cashstory.com'
            },
            '/wekan_remote': {
                target: 'http://wekan.cashstory.com'
            },
            '/toucan_remote': {
                target: 'http://viz.cashstory.com'
            },
            '/jupyter_remote': {
                target: 'http://datascience.cashstory.com'
            },
            '/api/:id/login': {
                bypass: (req, res) => {
                    const id = req.url.split('/')[2];
                    res.sendFile(`/dist/public/${id}/logged.html`, { root : __dirname})
                }
            },
        }
    },
    entry : {
        test_parent: entryPointsPathPrefix + '/test_parent.ts',
        test_child: entryPointsPathPrefix + '/test_child.ts',
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
        {
            test: /\.css$/,
            use: [
                'css-modules-typescript-loader',
                {
                loader: 'css-loader',
                options: {
                    modules: true
                }
                }
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