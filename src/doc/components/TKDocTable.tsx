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
    // console.log(props.values);
    return (
        <table className={classes.table}>
            <thead className={classes.tableHead}>
                <tr>
                    {props.colConfigs.map((colConfig: ColConfig) =>
                        <th className={classes.headerCell}>
                            {colConfig.title}
                        </th>)}
                </tr>
            </thead>
            {props.values.map((value: any) => {
                const showDivider = value.tags?.divider;
                return (
                    <tr className={showDivider ? classes.divider : undefined}>
                        {props.colConfigs.map((colConfig: ColConfig) => <td className={classes.cell}>
                            {colConfig.renderer(value)}
                        </td>
                        )}
                    </tr>
                );
            }
            )}
        </table>
    );
}

export default injectSheet(tKDocTableStyle)(TKDocTable);