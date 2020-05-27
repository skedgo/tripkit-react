const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

module.exports = {
    paths: function(paths, env) {
        // ...add your paths config
        paths.appBuild = resolveApp('dist');
        return paths;
    },
    webpack: function (config, env) {
        if (env === "production") {

            // #Modular lib
            // config.entry = {
            //     index: path.join(__dirname, "src/index.tsx"),
            //     query: path.join(__dirname, "src/query/TKUIRoutingQueryInput.tsx")
            // };

            //JS Overrides
            config.output.filename = 'index.js';
            config.output.chunkFilename = '[name].chunk.js';
            // #Modular lib
            // config.output.path = path.join(__dirname, "dist");
            // config.output.filename = '[name].js';

            //CSS Overrides
            const miniCssOptions = {
                filename: 'index.css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
            };
            config.plugins.forEach( (p,i) => {
                if( p instanceof MiniCssExtractPlugin) {
                    //delete p;
                    config.plugins.splice(i,1, new MiniCssExtractPlugin( miniCssOptions ));
                    // config.plugins.splice(i+1,0, HTMLInlineCSSWebpackPlugin());
                }
            });
        }

        config.optimization.splitChunks = {
            cacheGroups: {
                default: false
            }
        };

        // config.mode = 'development';
        // config.optimization.minimize = false;
        // config.optimization.usedExports = true;
        // config.optimization.concatenateModules = true;

        config.optimization.runtimeChunk = false;

        // Build React components library with Webpack 4
        // https://stackoverflow.com/questions/56970495/build-react-components-library-with-webpack-4
        config.output.libraryTarget = "umd";
        config.output.library = "tripkit-react";

        // #Modular lib
        // config.output.library = ["tripkit-react", "[name]"];

        return config;
    }
};