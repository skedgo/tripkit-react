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
            config.plugins[4].options.filename = 'index.css';
            // #Modular lib
            // config.plugins[4].options.filename = '[name].css';


            // config.externals = {
            //     react: 'react'
            // };

        }

        // config.optimization.minimize = false;

        config.optimization.splitChunks = {
            cacheGroups: {
                default: false
            }
        };

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