const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        orgChart: './lib/orgChart.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'orgChart',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: 'css-loader',
            },
        ],
    },
};
