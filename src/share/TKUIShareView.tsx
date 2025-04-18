import * as React from "react";
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIShareViewDefaultStyle} from "./TKUIShareView.css";
import {ReactComponent as IconLink} from "../images/share/ic-copy-link.svg";
import copy from "copy-to-clipboard";
import classNames from "classnames";
import QRCode from "qrcode.react";
import TKUITooltip from "../card/TKUITooltip";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import {tKUIColors} from "../jss/TKUITheme";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    link?: string;
    customMsg: string;
}

type IStyle = ReturnType<typeof tKUIShareViewDefaultStyle>

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIShareViewProps = IProps;
export type TKUIShareViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
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
        const t = this.props.t;
        return (!this.props.link ?
                <div className={classes.loadingPanel}>
                    <IconSpin className={classes.iconLoading} focusable="false"/>
                </div> :
                <div className={classes.main}>
                    <div className={classNames(classes.qrSharePanel, classes.separation)}>
                        <div className={classes.qrLabel}>
                            {t("See.it.on.your.mobile.device")}
                        </div>
                        <div className={classes.qrCode}>
                            {this.props.link &&
                            <QRCode value={this.props.link}/>
                            }
                        </div>
                        <div className={classes.qrLabel}>
                            {t("Scan.the.QR.code.with.your.device.camera")}
                        </div>
                    </div>
                    <TKUITooltip
                        overlayContent={t("Copied.to.clipboard")}
                        placement={"bottom"}
                        visible={this.state.copiedTooltip}
                        arrowColor={tKUIColors.black2}
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
                    </TKUITooltip>
                </div>
        );
    }

}

export default connect(
    (config: TKUIConfig) => config.TKUIShareView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps))

