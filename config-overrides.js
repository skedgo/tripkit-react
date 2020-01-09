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

module.exports = {
    webpack: function (config, env) {
        if (env === "production") {
            //JS Overrides
            config.output.filename = 'static/js/[name].js';
            config.output.chunkFilename = 'static/js/[name].chunk.js';

            //CSS Overrides
            config.plugins[4].options.filename = 'static/css/[name].css';

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