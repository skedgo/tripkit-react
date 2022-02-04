import * as React from "react";
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUISidebarDefaultStyle } from "./TKUISidebar.css";
import { connect, mapperFromFunction, TKStyleOverride } from "../config/TKConfigHelper";
import { ReactComponent as IconCross } from '../images/ic-cross2.svg';
import genStyles, { genClassNames } from "../css/GenStyle.css";
import classNames from "classnames";
import { black, TKUITheme } from "../jss/TKUITheme";
import TKUIDirectionsAction from "../action/TKUIRouteToLocationAction";
import { default as TKUIButton, TKUIButtonType } from "../buttons/TKUIButton";
import { ReactComponent as IconFavourite } from "../images/ic-favorite-outline.svg";
import { ReactComponent as IconSettings } from "../images/ic-settings-gear.svg";
import Modal from 'react-modal';
import appleStoreLogo from "../images/apple-store-logo.png";
import playStoreLogo from "../images/play-store-logo.png";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    open?: boolean;
    onRequestClose: () => void;
    onShowFavourites?: () => void;
    onShowSettings?: () => void;
    menuItems?: (defaultMenuItems: JSX.Element[]) => React.ReactNode;
    nativeAppsTitle?: string;
    renderNativeAppLinks?: () => React.ReactNode;
    appStoreUrl?: string;
    appStoreImageUrl?: string;
    playStoreUrl?: string;
    playStoreImageUrl?: string;
    renderLogo?: () => React.ReactNode;
    parentElement?: any;
    appMainElement?: any;
}

type IStyle = ReturnType<typeof tKUISidebarDefaultStyle>;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUISidebarProps = IProps;
export type TKUISidebarStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISidebar {...props} />,
    styles: tKUISidebarDefaultStyle,
    classNamePrefix: "TKUISidebar"
};

class TKUISidebar extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        open: true
    };

    constructor(props: IProps) {
        super(props);
        this.getDefaultMenuItems = this.getDefaultMenuItems.bind(this);
    }

    private getDefaultMenuItems() {
        const buttonStylesOverride = (theme: TKUITheme) => ({
            main: overrideClass({
                padding: '8px 16px!important',
                '&:hover': {
                    background: black(5, theme.isDark)
                },
                ...theme.textWeightRegular,
                color: black(1, theme.isDark) + '!important',
                border: 'none!important',
                width: '100%!important',
                ...genStyles.justifyStart
            })
        });
        const props = this.props;
        const t = props.t;
        return [
            <TKStyleOverride componentKey={"TKUIButton"} stylesOverride={buttonStylesOverride} key={1}>
                <TKUIDirectionsAction
                    text={t("Get.directions")}
                    buttonType={TKUIButtonType.SECONDARY}
                    onClick={props.onRequestClose}
                />
            </TKStyleOverride>,
            <TKUIButton
                text={t("Favourites")}
                icon={<IconFavourite />}
                type={TKUIButtonType.SECONDARY}
                styles={buttonStylesOverride}
                onClick={() => {
                    props.onShowFavourites && props.onShowFavourites();
                    props.onRequestClose();
                }}
                key={2}
            />,
            <TKUIButton
                text={t("Profile")}
                icon={<IconSettings style={{ width: '22px', height: '22px' }} />}
                type={TKUIButtonType.SECONDARY}
                styles={buttonStylesOverride}
                onClick={() => {
                    props.onShowSettings && props.onShowSettings();
                    props.onRequestClose();
                }}
                key={3}
            />
        ];
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const t = this.props.t;
        const defaultMenuItems = this.getDefaultMenuItems();
        const menuItems = this.props.menuItems ? this.props.menuItems(defaultMenuItems) : defaultMenuItems;
        const logo = this.props.renderLogo ? this.props.renderLogo() : <div></div>;
        return (
            <Modal
                isOpen={this.props.open!}
                style={{
                    overlay: this.props.injectedStyles.modalContainer as any
                }}
                shouldCloseOnEsc={true}
                shouldReturnFocusAfterClose={false}
                onRequestClose={() => this.props.onRequestClose && this.props.onRequestClose()}
                appElement={this.props.appMainElement}
                parentSelector={this.props.parentElement ? () => this.props.parentElement : undefined}
                className={{
                    base: classNames(classes.modal, genClassNames.root),
                    afterOpen: classes.slideIn,
                    beforeClose: classes.slideOut
                }}
                closeTimeoutMS={100}
                role={"navigation"}
                contentLabel={"Menu"}
                overlayRef={(instance: HTMLDivElement) => {
                    // To avoid groups appearing on Articles in voiceover web rotor,
                    // however a group seems to still appear anyway.
                    instance && instance.setAttribute("role", "none");
                    instance && instance.parentElement && instance.parentElement.setAttribute("role", "none")
                }}
            >
                <div className={classes.main}>
                    <div className={classes.header}>
                        {logo}
                        <button className={classes.closeBtn} onClick={this.props.onRequestClose}
                            aria-label={"Close"}
                        >
                            <IconCross />
                        </button>
                    </div>
                    <div className={classes.body}>
                        <div className={classes.menuItems}>
                            {menuItems}
                        </div>
                        {(this.props.renderNativeAppLinks || this.props.appStoreUrl || this.props.playStoreUrl) &&
                            <div className={classes.nativeAppLinksPanel}>
                                <div className={classes.nativeAppsTitle}>
                                    {this.props.nativeAppsTitle || t("Get.mobile.app") + ":"}
                                </div>
                                <div className={classes.nativeAppLinks}>
                                    {this.props.renderNativeAppLinks ? this.props.renderNativeAppLinks() :
                                        <React.Fragment>
                                            {this.props.appStoreUrl &&
                                                <button onClick={() => window.open(this.props.appStoreUrl, '_blank')}
                                                    className={classes.storeButton}
                                                    aria-label="Download on the App Store"
                                                    role="link"
                                                >
                                                    <img src={this.props.appStoreImageUrl || appleStoreLogo} key={'appleStoreLogo'} style={{ width: '100%', height: '100%' }} />
                                                </button>}
                                            {this.props.playStoreUrl &&
                                                <button onClick={() => window.open(this.props.playStoreUrl, '_blank')}
                                                    className={classes.storeButton}
                                                    aria-label="Download on Google Play"
                                                    role="link"
                                                >
                                                    <img src={this.props.playStoreImageUrl || playStoreLogo} key={'playStoreLogo'} style={{ width: '100%', height: '100%' }} />
                                                </button>}
                                        </React.Fragment>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </Modal>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUISidebar, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

