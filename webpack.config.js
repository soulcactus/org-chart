const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        'org-chart': './lib/orgChart.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'org-chart',
        libraryExport: 'default',
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
                use: ['handlebars-loader', 'extract-loader', 'css-loader'],
            },
        ],
    },
};
