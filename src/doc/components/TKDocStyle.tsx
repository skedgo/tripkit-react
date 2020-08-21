import * as React from "react";
import TKDocTable from "./TKDocTable";

export interface TKDocStyleProps {
    classNames: string[];
}

function TKDocStyle(props: TKDocStyleProps) {
    return (
        <TKDocTable
            colConfigs={[
                { title: 'Class name', renderer: (value: any) =>
                        <div style={{fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace', color: 'rgb(102, 153, 0)'}}>
                            {value}
                        </div>}
            ]}
            values={props.classNames}
        />
    );
}

export default TKDocStyle;