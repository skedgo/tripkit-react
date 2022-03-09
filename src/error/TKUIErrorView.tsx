import * as React from "react";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKError } from "./TKError";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { tKUIErrorViewDefaultStyle } from "./TKUIErrorView.css";
import { ReactComponent as ImgConstruction } from "../images/img-construction.svg";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    error: TKError;
    message?: string;
    actions?: JSX.Element[];
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

interface IStyle {
    main: CSSProps<IProps>;
    imgConstruction: CSSProps<IProps>;
    message: CSSProps<IProps>;
    title: CSSProps<IProps>;
    subtitle: CSSProps<IProps>;
    errorActions: CSSProps<IProps>;
}

export type TKUIErrorViewProps = IProps;
export type TKUIErrorViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIErrorView {...props} />,
    styles: tKUIErrorViewDefaultStyle,
    classNamePrefix: "TKUIErrorView"
};

class TKUIErrorView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const { error, message, actions, classes } = this.props;
        const title = message || error.title || error.message || error.subtitle || "Something went wrong."
        const subtitle = (message || error.title || error.message) ? error.subtitle : undefined;
        const messageToDisplay =
            <div className={classes.message}>
                <div className={classes.title}>
                    {title}
                </div>
                <div className={classes.subtitle}>
                    {subtitle}
                </div>
            </div>;
        return (
            <div className={classes.main} role="alert">
                <ImgConstruction className={classes.imgConstruction} />
                {messageToDisplay}
                {actions && actions.length > 0 &&
                    <div className={classes.errorActions}>
                        {actions}
                    </div>}
            </div>
        )
    }

}

export default connect((config: TKUIConfig) => config.TKUIErrorView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));