var path = require('path');

module.exports = {
    // Change to your "entry-point".
    entry: './src/index',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'bobRpa',
        filename: 'bob_rpa.js'
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