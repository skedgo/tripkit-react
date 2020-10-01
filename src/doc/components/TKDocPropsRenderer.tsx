import * as React from "react";
import TKDocTable from "./TKDocTable";
import {PropDescriptor} from 'react-styleguidist/lib/client/rsg-components/Props/util';
import Markdown from './TKDocMarkdown';
import renderExtra from 'react-styleguidist/lib/client/rsg-components/Props/renderExtra';
import Para from 'react-styleguidist/lib/client/rsg-components/Para';
import JsDoc from 'react-styleguidist/lib/client/rsg-components/JsDoc';
import Arguments from 'react-styleguidist/lib/client/rsg-components/Arguments';
import Argument from 'react-styleguidist/lib/client/rsg-components/Argument';
import {resolveRelativeLinks, typeReferencesToLinks} from "../TKDocUtil";

import { useStyleGuideContext } from 'react-styleguidist/lib/client/rsg-components/Context/Context';

function isPrimitiveType(type: string) {
    return type === 'boolean' || type === 'string' || type === 'number';
}

export function TKDocPropsRenderer({props}) {
    if (!props) {
        return null;
    }
    return (
        <TKDocTable
            colConfigs={[
                { title: 'Prop name', renderer: (value: any) =>
                        <div style={{fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace', color: 'rgb(102, 153, 0)',}}>
                            {value.name}
                        </div>},
                { title: 'Type', renderer: (value: any) => {
                        let type = value.type.name;
                        if (isPrimitiveType(type)) {
                            return type;
                        }
                        if (value.tags && value.tags.ctype && value.tags.ctype.length > 0) {
                            if (value.tags.ctype[0].description) {
                                return <Markdown text={typeReferencesToLinks(value.tags.ctype[0].description)}/>;
                            } else {
                                return <Markdown text={typeReferencesToLinks(type)}/>;
                            }
                        }
                        if (type.includes('=>')) {
                            type = 'function'
                        } else if (type.startsWith("Properties<string | 0>")) {
                            type = 'HTML DOM Style Object'
                        } else {
                            type = 'object'
                        }
                        return type;
                    }},
                { title: 'Default', renderer: (value: any) => {
                        let defaultText = value.defaultValue && value.defaultValue.value ? value.defaultValue.value : (value.required ? 'Required' : '');
                        if (value.tags && value.tags.globaldefault) {
                            defaultText += (defaultText ? " " : "") + "Provided by SDK [global state](TKState)."
                        }
                        return <Markdown text={defaultText}/>;
                    }},
                { title: 'Description', renderer: (value: any) => renderDescription(value)}
            ]}
            values={props}
        />
    );
}

function renderDescription(prop: any) {
    const { description, tags = {} } = prop;
    const extra = renderExtra(prop);
    const args = [...(tags.arg || []), ...(tags.argument || []), ...(tags.param || [])];
    const returnDocumentation = (tags.return && tags.return[0]) || (tags.returns && tags.returns[0]);
    return (
        <div>
            {description && <Markdown text={resolveRelativeLinks(description)} />}
            {extra && <Para>{extra}</Para>}
            <JsDoc {...tags} />
            {args.length > 0 && <Arguments args={args} heading />}
            {returnDocumentation && <Argument {...{ ...returnDocumentation, name: '' }} returns />}
        </div>
    );
}

export default TKDocPropsRenderer;