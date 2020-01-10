// const {
//     disableChunk
// } = require("customize-cra");

// var customizeCRA = require("customize-cra");

// var exports = customizeCRA.override(
//     customizeCRA.disableChunk()
// );
//
// exports.webpack = function(config, env) {
//     if (env === "production") {
//         //JS Overrides
//         config.output.filename = 'static/js/[name].js';
//         config.output.chunkFilename = 'static/js/[name].chunk.js';
//
//         //CSS Overrides
//         config.plugins[8].filename = 'static/css/[name].css';
//
//         //Media and Assets Overrides
//         // config.module.rules[1].oneOf[0].options.name = 'static/media/[name].[ext]';
//         // config.module.rules[1].oneOf[3].options.name = 'static/media/[name].[ext]';
//         /**
//          * If the media/assets public path differs on the server
//          *
//          * config.module.rules[1].oneOf[0].options.name = 'static/media/[name].[ext]';
//          * config.module.rules[1].oneOf[0].options.publicPath = '/public/assets/';
//          * config.module.rules[1].oneOf[3].options.name = 'static/media/[name].[ext]';
//          * config.module.rules[1].oneOf[3].options.publicPath = '/public/assets/';
//          */
//
//     }
//
//     return config;
// };
//
// module.exports = exports;

const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
    paths: function(paths, env) {
        // ...add your paths config
        paths.appBuild = resolveApp('dist');
        return paths;
    },
    webpack: function (config, env) {
        if (env === "production") {
            //JS Overrides
            // config.output.filename = 'static/js/[name].js';
            // config.output.chunkFilename = 'static/js/[name].chunk.js';
            config.output.filename = 'index.js';
            config.output.chunkFilename = '[name].chunk.js';

            //CSS Overrides
            config.plugins[4].options.filename = 'index.css';

            //Media and Assets Overrides
            // config.module.rules[1].oneOf[0].options.name = 'static/media/[name].[ext]';
            // config.module.rules[1].oneOf[3].options.name = 'static/media/[name].[ext]';
            /**
             * If the media/assets public path differs on the server
             *
             * config.module.rules[1].oneOf[0].options.name = 'static/media/[name].[ext]';
             * config.module.rules[1].oneOf[0].options.publicPath = '/public/assets/';
             * config.module.rules[1].oneOf[3].options.name = 'static/media/[name].[ext]';
             * config.module.rules[1].oneOf[3].options.publicPath = '/public/assets/';
             */

            // console.log(config.externals);

            // config.externals = {
            //     react: 'react'
            // };

            // console.log(config.externals);

        }

        config.optimization.splitChunks = {
            cacheGroups: {
                default: false
            }
        };

        config.optimization.runtimeChunk = false;

        // config.optimization.minimize = false;

        // Build React components library with Webpack 4
        // https://stackoverflow.com/questions/56970495/build-react-components-library-with-webpack-4
        config.output.libraryTarget = "umd";
        config.output.library = "tripkit-react";

        return config;
    }
};