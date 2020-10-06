const styleguideConfig = require('./data/sections.json');
const componentsApiSection = styleguideConfig.sections.find((section: any) => section.content === "src/doc/md/ComponentsAPI.md");
const modelSection = styleguideConfig.sections.find((section: any) => section.content === "src/doc/md/Model.md");

export function getDocUrl(fileName: string): string | undefined {
    let path: string | undefined = undefined;
    for (const docComponentPath of componentsApiSection.components) {
        if (docComponentPath.endsWith(fileName + ".tsx") || docComponentPath.endsWith(fileName + ".ts")) {
            path = "#/Components%20API/" + fileName;
            break;
        }
    }
    for (const docComponentPath of modelSection.components) {
        if (docComponentPath.endsWith(fileName + ".tsx") || docComponentPath.endsWith(fileName + ".ts")) {
            path = "#/Model/" + fileName;
            break;
        }
    }
    return path;
}

export function resolveRelativeLinks(mdText: string): string {
    let result = mdText;
    const regexMdLinks = /\[([^\[]*)\]\((.[^\)]*)\)/gm;
    const matches = mdText.match(regexMdLinks);
    const singleMatch = /\[([^\[]*)\]\((.[^\)]*)\)/;
    if (matches) {
        for (let i = 0; i < matches.length; i++) {
            let text = singleMatch.exec(matches[i]);
            if (!text) {
                continue;
            }
            // console.log(`Match #${i}:`, text);
            // console.log(`Word  #${i}: ${text[1]}`);
            // console.log(`Link  #${i}: ${text[2]}`);
            const word = text[1] ? text[1] : text[2];
            const url = getDocUrl(text[2]) || text[2];
            const resolvedLink = "[" + word + "](" + url + ")";
            result = result.replace(text[0], resolvedLink);
        }
    }
    return result;
}

export function typeReferencesToLinks(typeText: string): string {
    const regexTypeRefs = /([\w\d]+)/gm;
    return typeText.replace(regexTypeRefs, (match) => {
        console.log(match);
        const url = getDocUrl(match);
        return url ? "[" + match + "](" + url + ")" : match;
    });
}