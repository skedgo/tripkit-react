import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import modularCss from "@modular-css/rollup";
import cssOnly from "rollup-plugin-css-only";
import postcss from 'rollup-plugin-postcss'
import url from "@rollup/plugin-url";
import svgr from "@svgr/rollup";
import json from "@rollup/plugin-json";
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import nodeGlobal from 'rollup-plugin-node-globals';

import * as react from 'react';
import * as reactDom from 'react-dom';
import * as reactIs from 'react-is';
// import * as reactJSS from 'react-jss';
// import L from 'leaflet';

// this.ROLLUP_NAMED_EXPORTS = [
//     ...this.ROLLUP_NAMED_EXPORTS,
//     {'node_modules/leaflet/dist/leaflet.js': [  'leaflet' ]},
//     {'node_modules/leaflet/dist/leaflet-src.js': [  'latLng', 'map','control' ]},
//
// ];

export default [
    // browser-friendly UMD build
    // {
    //     input: 'src/index.tsx',
    //     output: {
    //         name: 'index',
    //         file: pkg.browser,
    //         format: 'umd'
    //     },
    //     plugins: [
    //         resolve(), // so Rollup can find `ms`
    //         commonjs({
    //             include: 'node_modules/**',
    //             namedExports: {
    //                 'leaflet': ["version", "noConflict", "Util", "extend", "bind", "stamp", "setOptions", "Class", "Evented", "Mixin", "Browser", "Point", "point", "Bounds", "bounds", "Transformation", "DomUtil", "LatLng", "latLng", "LatLngBounds", "latLngBounds", "Projection", "CRS", "Map", "map", "Layer", "DomEvent", "PosAnimation", "GridLayer", "gridLayer", "TileLayer", "tileLayer", "ImageOverlay", "imageOverlay", "Icon", "icon", "Marker", "marker", "DivIcon", "divIcon", "DivOverlay", "Popup", "popup", "Tooltip", "tooltip", "LayerGroup", "layerGroup", "FeatureGroup", "featureGroup", "Renderer", "Path", "LineUtil", "Polyline", "polyline", "PolyUtil", "Polygon", "polygon", "Rectangle", "rectangle", "CircleMarker", "circleMarker", "Circle", "circle", "SVG", "svg", "Canvas", "canvas", "GeoJSON", "geoJSON", "geoJson", "Draggable", "Handler", "Control", "control", 'VideoOverlay'],
    //                 'react': Object.keys(react),
    //                 'react-dom': Object.keys(reactDom),
    //                 'react-is': ['ForwardRef'],
    //                 'fbemitter': ['EventEmitter'],
    //                 'react-jss': ["ThemeProvider", "withTheme", "createTheming", "JssProvider", "jss", "SheetsRegistry", "createGenerateClassName"],
    //                 'node_modules/@material-ui/utils/node_modules/react-is/index.js': ['ForwardRef'],
    //                 'node_modules/@material-ui/core/node_modules/react-is/index.js': ['isFragment'],
    //                 'react-dom/server': ['renderToStaticMarkup'],
    //                 'node_modules/@material-ui/utils/esm/elementTypeAcceptingRef.js': ['elementType']
    //
    //             },
    //         }), // so Rollup can convert `ms` to an ES module
    //         typescript(), // so Rollup can convert TypeScript to JavaScript
    //         nodeGlobal(),
    //         babel({
    //             exclude: 'node_modules/**',
    //         }),
    //         css(),
    //         url(),
    //         svgr(),
    //         json()
    //     ]
    // },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/index.tsx',
        external: ['react-drag-drawer'],
        plugins: [
            typescript(), // so Rollup can convert TypeScript to JavaScript
            // cssOnly({ output: 'index.css' }),
            // modularCss(),
            postcss({
                autoModules: true
            }),
            url(),
            svgr(
                // {
                // svgoConfig: {
                //     plugins: {
                        // removeViewBox: false
                        // removeTitle: false
                    // }
                // }
            // }
            ),
            json()
        ],
        preserveModules: true,
        output:
            // [
            // { file: pkg.main, format: 'cjs' },
            {
                dir: 'dist'
            },
            // { file: pkg.module, format: 'es' }
        // ]
    }
];