var path = require('path');
var entryPointsPathPrefix = './src';

module.exports = {
    mode: 'production',
    entry : {
        test_parent: entryPointsPathPrefix + '/test_parent.ts',
        jupyter: entryPointsPathPrefix + '/jupyter.ts',
        wekan: entryPointsPathPrefix + '/wekan.ts',
        toucan: entryPointsPathPrefix + '/toucan.ts',
        healthcheck: entryPointsPathPrefix + '/healthcheck.ts',
        filestash: entryPointsPathPrefix + '/filestash.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'bobRpa',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json', '.css', '.html'],
    },
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
};