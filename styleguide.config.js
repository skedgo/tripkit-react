const path = require('path');
const sectionsJson = require('./src/doc/data/sections.json');

module.exports = {
    styleguideDir: 'docs/site/reference',
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
        }
    ).parse,

    moduleAliases: {
        'tripkit-react': path.resolve(__dirname, 'src'),
        'doc-helper': path.resolve(__dirname, 'src/doc/components/TKDocHelper')
    }

};