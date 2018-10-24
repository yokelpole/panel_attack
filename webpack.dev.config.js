var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var WebpackSynchronizableShellPlugin = require('webpack-synchronizable-shell-plugin');

module.exports = {
    entry: path.join(__dirname, 'src/app.ts'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'game.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js'),
            assets: path.join(__dirname, 'assets/')
        }
    },
    plugins: [
        new WebpackSynchronizableShellPlugin({
            onBuildStart: {
                scripts: ['npm run assets:dev'],
                blocking: true,
                parallel: false
            }
        }),
        new webpack.DefinePlugin({
            'DEBUG': true,

            // Do not modify these manually, you may break things...
            'DEFAULT_GAME_WIDTH': /*[[DEFAULT_GAME_WIDTH*/720/*DEFAULT_GAME_WIDTH]]*/,
            'DEFAULT_GAME_HEIGHT': /*[[DEFAULT_GAME_HEIGHT*/1280/*DEFAULT_GAME_HEIGHT]]*/,
            'MAX_GAME_WIDTH': /*[[MAX_GAME_WIDTH*/720/*MAX_GAME_WIDTH]]*/,
            'MAX_GAME_HEIGHT': /*[[MAX_GAME_HEIGHT*/1280/*MAX_GAME_HEIGHT]]*/,
            'SCALE_MODE': JSON.stringify(/*[[SCALE_MODE*/'SHOW_ALL'/*SCALE_MODE]]*/),

            // The items below most likely the ones you should be modifying
            'GOOGLE_WEB_FONTS': JSON.stringify([ // Add or remove entries in this array to change which fonts are loaded
                'Barrio'
            ]),
            'SOUND_EXTENSIONS_PREFERENCE': JSON.stringify([ // Re-order the items in this array to change the desired order of checking your audio sources (do not add/remove/modify the entries themselves)
                'webm', 'ogg', 'm4a', 'mp3', 'aac', 'ac3', 'caf', 'flac', 'mp4', 'wav'
            ])
        }),
        new CleanWebpackPlugin([
            path.join(__dirname, 'dist')
        ]),
        new HtmlWebpackPlugin({
            title: 'DEV MODE: Phaser NPM Webpack TypeScript Starter Project!',
            template: path.join(__dirname, 'templates/index.ejs')
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        inline: true,
        watchOptions: {
            aggregateTimeout: 300,
            ignored: [/node_modules/, /assets/],
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, enforce: 'pre', loader: 'tslint-loader' },
            { test: /assets(\/|\\)/, loader: 'file-loader?name=assets/[hash].[ext]' },
            { test: /pixi\.js$/, loader: 'expose-loader?PIXI' },
            { test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
            { test: /p2\.js$/, loader: 'expose-loader?p2' },
            { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' }
        ]
    },
    devtool: 'source-map'
};
