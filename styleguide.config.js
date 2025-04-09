const path = require('path');
const sectionsJson = require('./src/doc/data/sections.json');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
    styleguideDir: 'docs/site/reference',
    template: {
        favicon: '/img/favicon/favicon-32x32.png'
    },
    title: 'TripKit React SDK Reference',
    defaultExample: 'src/doc/md/ComponentDoc.md',
    sortProps: props => props,
    sections: sectionsJson.sections,
    pagePerSection: true,

    // Override Styleguidist components
    styleguideComponents: {
        PropsRenderer: path.join(__dirname, 'src/doc/components/TKDocPropsRenderer.tsx'),
        TabButton: path.join(__dirname, 'src/doc/components/TKDocTabButton.tsx'),
        Markdown: path.join(__dirname, 'src/doc/components/TKDocMarkdown.tsx')
    },

    propsParser: require('react-docgen-typescript').withCustomConfig(
        './tsconfig.json', {
        shouldRemoveUndefinedFromOptional: true,
        shouldExtractLiteralValuesFromEnum: true
    }).parse,

    moduleAliases: {
        'tripkit-react': path.resolve(__dirname, 'src'),
        'doc-helper': path.resolve(__dirname, 'src/doc/components/TKDocHelper')
    },

    styles: {
        StyleGuide: {
            content: {
                maxWidth: 1300
            }
        }
    },
    dangerouslyUpdateWebpackConfig(webpackConfig, env) {
        // Remove ModuleScopePlugin to allow imports outside of src/
        webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
            plugin => !(plugin instanceof ModuleScopePlugin)
        );

        console.log("✅ Removed ModuleScopePlugin restriction");

        return webpackConfig;
    }

};