import * as React from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import genStyles from "../css/GenStyle.css";
import { important, TKUITheme } from "../jss/TKUITheme";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig } from "../config/TKComponentConfig";

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
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title: string;
    subtitle?: React.ReactNode;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIRow {...props} />,
    styles: tKUIRowJss,
    classNamePrefix: "TKUIRow"
};

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

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));