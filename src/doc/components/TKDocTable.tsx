import * as React from "react";
import { tKDocTableStyle } from "./TKDocTable.css";
import injectSheet from "react-jss";
import { Classes } from "jss";

interface ColConfig {
    title: string,
    renderer: (value: any) => JSX.Element
}

export interface TKDocStyleProps {
    colConfigs: ColConfig[];
    values: any[];
}

function TKDocTable(props: TKDocStyleProps & { classes: Classes<keyof typeof tKDocTableStyle>; }) {
    const classes = props.classes;    
    return (
        <table className={classes.table}>
            <thead className={classes.tableHead}>
                <tr>
                    {props.colConfigs.map((colConfig: ColConfig, i) =>
                        <th className={classes.headerCell} key={i}>
                            {colConfig.title}
                        </th>)}
                </tr>
            </thead>
            <tbody>
                {props.values.map((value, i) => {
                    const showDivider = value.tags?.divider;
                    return (
                        <tr className={showDivider ? classes.divider : undefined} key={i}>
                            {props.colConfigs.map((colConfig: ColConfig, i) => (
                                <td className={classes.cell} key={i}>
                                    {colConfig.renderer(value)}
                                </td>
                            ))}
                        </tr>
                    );
                }
                )}
            </tbody>
        </table>
    );
}

export default injectSheet(tKDocTableStyle)(TKDocTable);