import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUISidebarDefaultStyle} from "./TKUISidebar.css";
import {connect, mapperFromFunction, TKStyleOverride} from "../config/TKConfigHelper";
import {ReactComponent as TripgoLogo} from '../images/logo/tripgo_logo.svg';
import {ReactComponent as IconCross} from '../images/ic-cross2.svg';
import genStyles, {genClassNames} from "../css/GenStyle.css";
import classNames from "classnames";
import {black} from "../jss/TKUITheme";
import TKUIDirectionsAction from "../action/TKUIRouteToLocationAction";
import {default as TKUIButton, TKUIButtonType} from "../buttons/TKUIButton";
import {ReactComponent as IconFavourite} from "../images/ic-favorite-outline.svg";
import {ReactComponent as IconSettings} from "../images/ic-settings-gear.svg";
import {TKUITheme} from "../index";
import Modal from 'react-modal';

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    open?: boolean;
    onRequestClose: () => void;
    onShowFavourites?: () => void;
    onShowSettings?: () => void;
    logo?: () => JSX.Element;
    menuItems?: (defaultMenuItems: JSX.Element[]) => React.ReactNode;
    nativeAppLinks?: () => React.ReactNode;
    parentElement?: any;
    appMainElement?: any;
}

export interface IStyle {
    modalContainer: CSSProps<IProps>;
    modal: CSSProps<IProps>;
    slideIn: CSSProps<IProps>;
    slideOut: CSSProps<IProps>;
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    closeBtn: CSSProps<IProps>;
    body: CSSProps<IProps>;
    menuItems: CSSProps<IProps>;
    nativeAppLinksPanel: CSSProps<IProps>;
    nativeAppsTitle: CSSProps<IProps>;
    nativeAppLinks: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUISidebarProps = IProps;
export type TKUISidebarStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISidebar {...props}/>,
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
            main: (defaultStyle) => ({
                ...defaultStyle,
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
            <TKStyleOverride componentKey={"TKUIButton"} stylesOverride={buttonStylesOverride} key={2}>
                <TKUIButton
                    text={t("Favourites")}
                    icon={<IconFavourite/>}
                    type={TKUIButtonType.SECONDARY}
                    onClick={() => {
                        props.onShowFavourites && props.onShowFavourites();
                        props.onRequestClose();
                    }}
                />
            </TKStyleOverride>,
            <TKStyleOverride componentKey={"TKUIButton"} stylesOverride={buttonStylesOverride} key={3}>
                <TKUIButton
                    text={t("Settings")}
                    icon={<IconSettings style={{width: '22px', height: '22px'}}/>}
                    type={TKUIButtonType.SECONDARY}
                    onClick={() => {
                        props.onShowSettings && props.onShowSettings();
                        props.onRequestClose();
                    }}
                />
            </TKStyleOverride>
        ];
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const t = this.props.t;
        const defaultMenuItems = this.getDefaultMenuItems();
        const menuItems = this.props.menuItems ? this.props.menuItems(defaultMenuItems) : defaultMenuItems;
        const logo = this.props.logo ? this.props.logo() : <TripgoLogo style={{height: '24px', width: '120px'}}/>
        return (
            <Modal
                isOpen={this.props.open!}
                style={{
                    overlay: this.props.injectedStyles.modalContainer
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
                contentLabel={"Menu"}
            >
                <div className={classes.main}>
                    <div className={classes.header}>
                        {logo}
                        <button className={classes.closeBtn} onClick={this.props.onRequestClose}
                                aria-label={"Close"}
                        >
                            <IconCross/>
                        </button>
                    </div>
                    <div className={classes.body}>
                        <div className={classes.menuItems}>
                            {menuItems}
                        </div>
                        {this.props.nativeAppLinks &&
                        <div className={classes.nativeAppLinksPanel}>
                            <div className={classes.nativeAppsTitle}>
                                {t("Get.mobile.app") + ":"}
                            </div>
                            <div className={classes.nativeAppLinks}>
                                {this.props.nativeAppLinks()}
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

