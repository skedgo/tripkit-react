import * as React from "react";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import RealTimeAlert from "../model/service/RealTimeAlert";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { ReactComponent as AlertIcon } from "../images/ic-alert.svg";
import { tKUIAlertRowDefaultStyle } from "./TKUIAlertRow.css";
import classNames from "classnames";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    alert: RealTimeAlert;
    asCard?: boolean;
    brief?: boolean;
    onClick?: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

interface IStyle {
    main: CSSProps<IProps>;
    asCard: CSSProps<IProps>;
    content: CSSProps<IProps>;
    alertIcon: CSSProps<IProps>;
    title: CSSProps<IProps>;
    text: CSSProps<IProps>;
}

export type TKUIAlertRowProps = IProps;
export type TKUIAlertRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIAlertRow {...props} />,
    styles: tKUIAlertRowDefaultStyle,
    classNamePrefix: "TKUIAlertRow"
};

function urlify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}

class TKUIAlertRow extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const alert = this.props.alert;
        return (
            <div className={classNames(classes.main, this.props.asCard && classes.asCard)}
                onClick={this.props.onClick} tabIndex={0}>
                <AlertIcon className={classes.alertIcon} aria-hidden={true} />
                <div className={classes.content}>
                    <div className={classes.title}>
                        {alert.title}
                    </div>
                    {!this.props.brief &&
                        <div className={classes.text}
                            dangerouslySetInnerHTML={{ __html: urlify(alert.text) }}
                        >
                        </div>}
                </div>
            </div>
        );
    }

}


export default connect((config: TKUIConfig) => config.TKUIAlertRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));