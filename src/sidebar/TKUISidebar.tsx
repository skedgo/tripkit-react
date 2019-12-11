import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ITKUIComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
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
import {TKUIButtonType} from "../buttons/TKUIButton";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    open?: boolean;
    onRequestClose: () => void;
    onShowFavourites: () => void;
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
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
    logo?: () => JSX.Element;
    menuItems?: (onRequestClose: () => void) => JSX.Element[];
    nativeAppLinks?: () => JSX.Element[];
}

export type TKUISidebarProps = IProps;
export type TKUISidebarStyle = IStyle;

const config: ITKUIComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISidebar {...props}/>,
    styles: tKUISidebarDefaultStyle,
    classNamePrefix: "TKUISidebar",
    configProps: {
        logo: () => <TripgoLogo style={{height: '24px', width: '120px'}}/>,
        menuItems: (onRequestClose: () => void) => [
            <TKUIDirectionsAction
                text={"Get Direction"}
                buttonType={TKUIButtonType.SECONDARY}
                key={1}
                onClick={onRequestClose}
                style={{border: 'none'}}
            />,
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
                marginTop: '15px'
            };
            return [
                <button style={storeBtnStyle}>
                    <AppleStoreLogo style={{marginRight: '10px'}}/> App Store
                </button>,
                <button style={storeBtnStyle}>
                    <PlayStoreLogo style={{marginRight: '10px'}}/> Google Play
                </button>
            ]}
    }
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
                        <button className={classes.closeBtn}>
                            <IconCross onClick={this.props.onRequestClose}/>
                        </button>
                    </div>
                    <div className={classes.body}>
                        <div className={classes.menuItems}>
                            {this.props.menuItems && this.props.menuItems(this.props.onRequestClose)}
                        </div>
                        {this.props.nativeAppLinks &&
                            <div className={classes.nativeAppLinksPanel}>
                                <div>Get mobile app:</div>
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

