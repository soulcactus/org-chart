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
<<<<<<< HEAD
            {
                test: /\.css$/,
                use: ['handlebars-loader', 'extract-loader', 'css-loader'],
            },
=======
>>>>>>> b532d09fee610432f588212a1e55aa90975234eb
        ],
    },
};
