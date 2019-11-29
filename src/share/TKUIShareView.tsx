import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ITKUIComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIShareViewDefaultStyle} from "./TKUIShareView.css";
import {ReactComponent as IconLink} from "../images/share/ic-copy-link.svg";
import copy from "copy-to-clipboard";
import Tooltip from "rc-tooltip";
import classNames from "classnames";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    link?: string;
    customMsg: string;
}

export interface IStyle {
    main: CSSProps<IProps>;
    qrSharePanel: CSSProps<IProps>;
    qrLabel: CSSProps<IProps>;
    qrCode: CSSProps<IProps>;
    qrCodeImg: CSSProps<IProps>;
    copyLinkPanel: CSSProps<IProps>;
    linkBox: CSSProps<IProps>;
    linkIcon: CSSProps<IProps>;
    copiedTooltip: CSSProps<IProps>;
    separation: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIShareViewProps = IProps;
export type TKUIShareViewStyle = IStyle;

const config: ITKUIComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIShareView {...props}/>,
    styles: tKUIShareViewDefaultStyle,
    classNamePrefix: "TKUIShareView",
};

interface IState {
    copiedTooltip: boolean;
}

class TKUIShareView extends React.Component<IProps, IState> {

    private linkInputRef: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            copiedTooltip: false
        };
        this.onCopyLink = this.onCopyLink.bind(this);
    }

    private onCopyLink() {
        this.props.link && copy(this.props.link);
        this.setState({
            copiedTooltip: true
        });
        setTimeout(() => this.setState({copiedTooltip: false}), 3000);
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                <div className={classNames(classes.qrSharePanel, classes.separation)}>
                    <div className={classes.qrLabel}>
                        See it on your mobile device
                    </div>
                    <div className={classes.qrCode}>
                        {this.props.link &&
                        <img
                            src={"https://api.qrserver.com/v1/create-qr-code/?format=svg&data=" + this.props.link}
                            className={classes.qrCodeImg}
                        />}
                    </div>
                    <div className={classes.qrLabel}>
                        Just scan the QR code with your phone or tablet camera
                    </div>
                </div>
                <Tooltip
                    overlay={"Link copied to clipboard"}
                    // placement={"bottom"}
                    placement={"bottom"}
                    overlayClassName={classes.copiedTooltip}
                    visible={this.state.copiedTooltip}
                >
                    <div className={classes.copyLinkPanel}>
                        <input className={classes.linkBox}
                               value={this.props.link}
                               readOnly={true}
                               onClick={() => {
                                   if (this.linkInputRef) {
                                       this.linkInputRef.select();
                                   }
                                   this.onCopyLink();
                               }}
                               ref={(ref: any) => this.linkInputRef = ref}
                        />
                        <IconLink className={classes.linkIcon}
                                  onClick={this.onCopyLink}
                        />
                    </div>
                </Tooltip>
            </div>
        );
    }

}

export default connect(
    (config: TKUIConfig) => config.TKUIShareView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps))

