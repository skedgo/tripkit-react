import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUISidebarDefaultStyle} from "./TKUISidebar.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import Drawer from 'react-drag-drawer';
import {ReactComponent as TripgoLogo} from '../images/logo/tripgo_logo.svg';
import {ReactComponent as IconCross} from '../images/ic-cross.svg';
import {ReactComponent as AppleStoreLogo} from '../images/logo/apple-store-logo.svg';
import {ReactComponent as PlayStoreLogo} from '../images/logo/play-store-logo.svg';
import genStyles from "../css/GenStyle.css";
import {tKUIColors} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";
import TKUIDirectionsAction from "../action/TKUIRouteToLocationAction";
import {default as TKUIButton, TKUIButtonType} from "../buttons/TKUIButton";
import {ReactComponent as IconFavourite} from "../images/ic-favorite-outline.svg";
import {ReactComponent as IconSettings} from "../images/ic-settings-gear.svg";
import DeviceUtil from "../util/DeviceUtil";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    open?: boolean;
    onRequestClose: () => void;
    onShowFavourites?: () => void;
    onShowSettings?: () => void;
}

export interface IStyle {
    modalContainer: CSSProps<IProps>;
    modal: CSSProps<IProps>;
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    closeBtn: CSSProps<IProps>;
    body: CSSProps<IProps>;
    menuItems: CSSProps<IProps>;
    nativeAppLinksPanel: CSSProps<IProps>;
    nativeAppsTitle: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
    logo?: () => JSX.Element;
    menuItems?: () => JSX.Element[];
    nativeAppLinks?: () => JSX.Element[];
}

export type TKUISidebarProps = IProps;
export type TKUISidebarStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISidebar {...props}/>,
    styles: tKUISidebarDefaultStyle,
    classNamePrefix: "TKUISidebar",
    props: (props: IProps) => ({
        logo: () => <TripgoLogo style={{height: '24px', width: '120px'}}/>,
        menuItems: () => [
            <TKUIDirectionsAction
                text={props.t("Get.directions")}
                buttonType={TKUIButtonType.SECONDARY}
                onClick={props.onRequestClose}
                style={{
                    border: 'none',
                    width: '100%',
                    ...genStyles.justifyStart
                }}
                key={1}
            />,
            <TKUIButton
                text={props.t("Favourites")}
                icon={<IconFavourite/>}
                type={TKUIButtonType.SECONDARY}
                style={{
                    border: 'none',
                    width: '100%',
                    ...genStyles.justifyStart
                }}
                onClick={() => {
                    props.onShowFavourites && props.onShowFavourites();
                    props.onRequestClose();
                }}
                key={2}
            />,
            <TKUIButton
                text={props.t("Settings")}
                icon={<IconSettings style={{width: '22px', height: '22px'}}/>}
                type={TKUIButtonType.SECONDARY}
                style={{
                    border: 'none',
                    width: '100%',
                    ...genStyles.justifyStart
                }}
                onClick={() => {
                    props.onShowSettings && props.onShowSettings();
                    props.onRequestClose();
                }}
                key={3}
            />
        ],
        nativeAppLinks: () => {
            const storeBtnStyle = {
                ...resetStyles.button,
                ...genStyles.flex,
                ...genStyles.alignCenter,
                border: '1px solid ' + tKUIColors.white1,
                ...genStyles.borderRadius(8),
                padding: '8px',
                width: '130px',
                marginTop: '15px',
                ...DeviceUtil.isIE && {
                    color: 'white'
                }
            };
            return [
                <button style={storeBtnStyle} key={1}
                        onClick={() => window.open("https://itunes.apple.com/app/apple-store/id533630842?pt=1111758&ct=Website&mt=8",'_blank')}
                >
                    <AppleStoreLogo style={{marginRight: '10px'}}/> App Store
                </button>,
                <button style={storeBtnStyle} key={2}
                        onClick={() => window.open("https://play.google.com/store/apps/details?id=com.buzzhives.android.tripplanner&hl=en",'_blank')}
                >
                    <PlayStoreLogo style={{marginRight: '10px'}}/> Google Play
                </button>
            ]}
    })
};

class TKUISidebar extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        open: true
    };

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <Drawer
                open={this.props.open}
                direction={'left'}
                modalElementClass={classes.modal}
                containerElementClass={classes.modalContainer}
            >
                <div className={classes.main}>
                    <div className={classes.header}>
                        {this.props.logo && this.props.logo()}
                        <button className={classes.closeBtn} onClick={this.props.onRequestClose}>
                            <IconCross/>
                        </button>
                    </div>
                    <div className={classes.body}>
                        <div className={classes.menuItems}>
                            {this.props.menuItems && this.props.menuItems()}
                        </div>
                        {this.props.nativeAppLinks &&
                            <div className={classes.nativeAppLinksPanel}>
                                <div className={classes.nativeAppsTitle}>
                                    Get mobile app:
                                </div>
                                {this.props.nativeAppLinks()}
                            </div>
                        }
                    </div>
                </div>
            </Drawer>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUISidebar, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

