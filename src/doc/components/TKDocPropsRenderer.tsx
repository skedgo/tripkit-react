import * as React from "react";
import TKDocTable from "./TKDocTable";
import {PropDescriptor} from 'react-styleguidist/lib/client/rsg-components/Props/util';
import Markdown from 'react-styleguidist/lib/client/rsg-components/Markdown';
import renderExtra from 'react-styleguidist/lib/client/rsg-components/Props/renderExtra';
import Para from 'react-styleguidist/lib/client/rsg-components/Para';
import JsDoc from 'react-styleguidist/lib/client/rsg-components/JsDoc';
import Arguments from 'react-styleguidist/lib/client/rsg-components/Arguments';
import Argument from 'react-styleguidist/lib/client/rsg-components/Argument';

export function TKDocPropsRenderer({props}) {
    return (
        <TKDocTable
            colConfigs={[
                { title: 'Prop name', renderer: (value: any) =>
                        <div style={{fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace', color: 'rgb(102, 153, 0)',}}>
                            {value.name}
                        </div>},
                { title: 'Type', renderer: (value: any) => value.type.name},
                { title: 'Default', renderer: (value: any) => {
                        let defaultText = value.defaultValue && value.defaultValue.value ? value.defaultValue.value : (value.required ? 'Required' : '');
                        if (value.tags && value.tags.globaldefault) {
                            defaultText += (defaultText ? " " : "") + "Provided by SDK global state. See [state doc](/#/TKStateConsumer)."
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
    console.log(prop);
    const { description, tags = {} } = prop;
    const extra = renderExtra(prop);
    const args = [...(tags.arg || []), ...(tags.argument || []), ...(tags.param || [])];
    const returnDocumentation = (tags.return && tags.return[0]) || (tags.returns && tags.returns[0]);

    return (
        <div>
            {description && <Markdown text={description} />}
            {extra && <Para>{extra}</Para>}
            <JsDoc {...tags} />
            {args.length > 0 && <Arguments args={args} heading />}
            {returnDocumentation && <Argument {...{ ...returnDocumentation, name: '' }} returns />}
        </div>
    );
}

export default TKDocPropsRenderer;