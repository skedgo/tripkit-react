import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIW3wDefaultStyle} from "./TKUIW3w.css";
import iconW3w from "../images/location/ic-what3words.png";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    w3w: string,
    w3wInfoURL?: string
}

export interface IStyle {
    main: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    details: CSSProps<IProps>;
    value: CSSProps<IProps>;
    url: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIW3wProps = IProps;
export type TKUIW3wStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIW3w {...props}/>,
    styles: tKUIW3wDefaultStyle,
    classNamePrefix: "TKUIW3w",
};


class TKUIW3w extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                <img src={iconW3w} className={classes.icon}/>
                <div className={classes.details}>
                    <div className={classes.value}>
                        {this.props.w3w}
                    </div>
                    <a href={this.props.w3wInfoURL}
                       target="_blank"
                       className={classes.url}
                    >
                        what3words address
                    </a>
                </div>
            </div>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUIW3w, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));