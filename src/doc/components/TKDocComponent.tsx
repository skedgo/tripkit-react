import React, {useState} from 'react';
import TKRoot from "../../config/TKRoot";
import TKDocStyle from "./TKDocStyle";
import {tKDocComponentStyle} from "./TKDocComponent.css";
import injectSheet from "react-jss";
import {ClassNameMap} from "react-jss";
import {TKRandomizeClassNamesOverride} from "../../config/TKConfigHelper";
import TKDocTabButton from "./TKDocTabButton";

export interface TKDocComponentProps {
    compName: string;
    docConfig: any;
}

function TKDocComponent(props: TKDocComponentProps & {classes: ClassNameMap<keyof typeof tKDocComponentStyle>;}) {
    const style = props.docConfig.style;
    const showcase = props.docConfig.showcase;
    const classes = props.classes;
    const [cssExpanded, setCssExpanded] = useState(true);
    const [demoExpanded, setDemoExpanded] = useState(true);
    return (
        <TKRoot config={{apiKey: '790892d5eae024712cfd8616496d7317', isDarkDefault: false}}>
            <div>
                {style &&
                <div className={classes.section}>
                    <TKDocTabButton onClick={() => {setCssExpanded(!cssExpanded)}} active={cssExpanded}>
                        CSS
                    </TKDocTabButton>
                    {cssExpanded &&
                    <div>
                        <TKDocStyle classNames={style}/>
                        <div className={classes.cssTip}>
                            Use DOM inspector of your browser on component demo below to see how classes are associated to HTML tags.
                        </div>
                    </div>}
                </div>}
                {showcase &&
                <div className={classes.section}>
                    <TKDocTabButton onClick={() => {setDemoExpanded(!demoExpanded)}} active={demoExpanded}>
                        Demo
                    </TKDocTabButton>
                    {demoExpanded &&
                    <TKRandomizeClassNamesOverride componentKey={props.compName} randomizeOverride={true} verboseOverride={true}>
                        {showcase()}
                    </TKRandomizeClassNamesOverride>}
                </div>}
            </div>
        </TKRoot>
    )
}

export default injectSheet(tKDocComponentStyle)(TKDocComponent);