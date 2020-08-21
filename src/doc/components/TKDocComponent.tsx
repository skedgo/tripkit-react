import * as React from "react";
import TKRoot from "../../config/TKRoot";
import TKDocStyle from "./TKDocStyle";
import {tKDocComponentStyle} from "./TKDocComponent.css";
import injectSheet from "react-jss";
import {ClassNameMap} from "react-jss";
import {TKRandomizeClassNamesOverride} from "../../config/TKConfigHelper";

export interface TKDocComponentProps {
    compName: string;
    docConfig: any;
}

function TKDocComponent(props: TKDocComponentProps & {classes: ClassNameMap<keyof typeof tKDocComponentStyle>;}) {
    const style = props.docConfig.style;
    const showcase = props.docConfig.showcase;
    const classes = props.classes;
    return (
        <TKRoot config={{apiKey: '790892d5eae024712cfd8616496d7317', isDarkDefault: false}}>
            <div>
                {style &&
                <div className={classes.section}>
                    <div className={classes.sectionTitle}>
                        CSS
                    </div>
                    <TKDocStyle classNames={style}/>
                    <div className={classes.cssTip}>
                        Use DOM inspector of your browser on component demo below to see how classes are associated to HTML tags.
                    </div>
                </div>}
                {showcase &&
                <div className={classes.section}>
                    <div className={classes.sectionTitle}>
                        Demo
                    </div>
                    <TKRandomizeClassNamesOverride componentKey={props.compName} randomizeOverride={true} verboseOverride={true}>
                        {showcase()}
                    </TKRandomizeClassNamesOverride>
                </div>}
            </div>
        </TKRoot>
    )
}

export default injectSheet(tKDocComponentStyle)(TKDocComponent);