import * as React from "react";
import {TKUIWithClasses, withStyles} from "../jss/StyleHelper";
import genStyles from "../css/GenStyle.css";
import {important, TKUITheme} from "../jss/TKUITheme";

const tKUIRowJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.spaceBetween,
        ...important(genStyles.alignStart),
        padding: '16px'
    },
    title: {
        ...genStyles.fontM,
        ...theme.textColorDefault
    },
    subtitle: {
        ...genStyles.fontS,
        ...theme.textColorGray
    }
});


type IStyle = ReturnType<typeof tKUIRowJss>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    title: string;
    subtitle?: React.ReactNode;
}

const TKUIRow: React.SFC<IProps> = (props: IProps) => {
    const classes = props.classes;
    return (
        <div className={classes.main}>
            <div className={classes.title}>
                {props.title}
            </div>
            {props.subtitle &&
            <div className={classes.subtitle}>
                {props.subtitle}
            </div>}
        </div>
    );
};

export default withStyles(TKUIRow, tKUIRowJss);