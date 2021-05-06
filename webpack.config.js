const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: "production",
    entry: {
        app: './src/index.ts'
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "src/resources", to: "resources" }
            ]
        })
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {
        filename: 'bundle.js'
    },
    devServer: {
    }
}