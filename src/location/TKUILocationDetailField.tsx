import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUILocationDetailFieldDefaultStyle} from "./TKUILocationDetailField.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    icon: React.ReactNode;
}

export interface IStyle {
    main: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    details: CSSProps<IProps>;
    title: CSSProps<IProps>;
    subtitle: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUILocationDetailFieldProps = IProps;
export type TKUILocationDetailFieldStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationDetailField {...props}/>,
    styles: tKUILocationDetailFieldDefaultStyle,
    classNamePrefix: "TKUILocationDetailField",
};


class TKUILocationDetailField extends React.Component<IProps, {}> {

    private toAnchor(text: string): React.ReactNode {
        // if (text.startsWith('http') || text.startsWith('tel:')) {
        try {
            const url = new URL(text);
            return (
                <a href={text}
                   tabIndex={-1}
                   target= {url.protocol !== 'tel:' ? "_blank" : undefined}>
                    {url.protocol === 'tel:' ? url.pathname : url.hostname}
                </a>
            );
        } catch (e) {
            return text;
        }
        // }
        // return text;
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <div className={classes.main} tabIndex={0}>
                <div className={classes.icon}>
                    {typeof this.props.icon === "string" ? <img src={this.props.icon} role="img" aria-hidden="true"/> : this.props.icon}
                </div>
                <div className={classes.details}>
                    <div className={classes.title}>
                        {typeof this.props.title === 'string' ? this.toAnchor(this.props.title as string) : this.props.title}
                    </div>
                    {this.props.subtitle &&
                    <div className={classes.subtitle}>
                        {typeof this.props.subtitle === "string" ? this.toAnchor(this.props.subtitle) : this.props.subtitle}
                    </div>}
                </div>
            </div>
        );
    }

}

/**
 * Displays [what3words](https://what3words.com/about-us/) address.
 */
export default connect((config: TKUIConfig) => config.TKUILocationDetailField, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));