import * as React from "react";
import {ReactComponent as IconInfo} from '../images/ic-info.svg';
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIMapPopupStyle} from "./TKUIMapPopup.css";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    subtitle?: string;
    onAction?: () => void;
    renderMoreInfo?: () => React.ReactNode;
    renderActionIcon?: () => React.ReactNode;
}

interface IStyle {
    main: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    button: CSSProps<IProps>;
    rightPanel: CSSProps<IProps>;
    separator: CSSProps<IProps>;
    title: CSSProps<IProps>;
    subtitle: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIMapPopupProps = IProps;
export type TKUIMapPopupStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapPopup {...props}/>,
    styles: tKUIMapPopupStyle,
    classNamePrefix: "TKUIMapPopup"
};

class TKUIMapPopup extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                {this.props.onAction &&
                <React.Fragment>
                    <button onClick={this.props.onAction}
                            className={classes.button}
                    >
                        {this.props.renderActionIcon ? this.props.renderActionIcon(): <IconInfo className={classes.icon}/>}
                    </button>
                    <div className={classes.separator}/>
                </React.Fragment>}
                <div className={classes.rightPanel}>
                    {this.props.title &&
                    <div className={classes.title}>
                        {this.props.title}
                    </div>
                    }
                    {this.props.subtitle &&
                    <div className={classes.subtitle}>
                        {this.props.subtitle}
                    </div>
                    }
                    {this.props.renderMoreInfo && this.props.renderMoreInfo()}
                </div>
            </div>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUIMapPopup, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));