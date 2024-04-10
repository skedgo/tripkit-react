import React from "react";
import { ReactComponent as IconPin } from '../images/map/ic-map-pin.svg';
import Location from "../model/Location";
import TransportUtil from "../trip/TransportUtil";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { isRemoteIcon, tKUIMapLocationIconDefaultStyle } from "./TKUIMapLocationIcon.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import classNames from "classnames";
import ModeLocation from "../model/location/ModeLocation";
import FacilityLocation from "../model/location/FacilityLocation";
import TKUIIcon, { iconNameByFacilityType } from "../service/TKUIIcon";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    from?: boolean;
    selected?: boolean; // TODO: if false it's a circle, if true is a drop. MapLocations changes selected for drop,
    // and from/to pin uses this always as drop. MapLocations pin will be behind from/to pin (at least until dissapears)
    // but will be identical. Selected is on MapLocations state, so update should be without delay?
    renderIcon?: () => React.ReactNode;
}

export interface IStyle {
    main: CSSProps<IProps>;
    iconPin: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    iconInverted: CSSProps<IProps>;
    clickAndHold: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIMapLocationIconProps = IProps;
export type TKUIMapLocationIconStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapLocationIcon {...props} />,
    styles: tKUIMapLocationIconDefaultStyle,
    classNamePrefix: "TKUIMapLocationIcon",
};

class TKUIMapLocationIcon extends React.PureComponent<IProps, {}> {

    private static idCount: number = 0;
    private id: string = "tripkit-map-pin" + TKUIMapLocationIcon.idCount++;
    private mouseDown = false;

    constructor(props: IProps) {
        super(props);
        setTimeout(() => {
            const elem = document.getElementById(this.id);
            const classes = this.props.classes;
            if (elem) {
                elem.addEventListener("mousedown", () => {
                    this.mouseDown = true;
                    setTimeout(() => {
                        if (this.mouseDown) {
                            elem.classList.add(classes.clickAndHold);
                        }
                    }, 300);
                });
                elem.addEventListener("mouseup", () => {
                    this.mouseDown = false;
                    elem.classList.remove(classes.clickAndHold);
                });
            }
        }, 500);
    }

    public render(): React.ReactNode {
        const location = this.props.location;
        let transIcon: React.ReactNode;
        let invertedWrtMode = false;
        if (location instanceof FacilityLocation && iconNameByFacilityType(location.facilityType)) {
            transIcon = <TKUIIcon iconName={iconNameByFacilityType(location.facilityType)!} onDark={true} />
            // transIcon = <TKUIIconBase iconName={iconNameByFacilityType(location.facilityType)!} {...this.props} />;
            // transIcon = this.props.children;
        } else if (location instanceof ModeLocation) {
            const modeInfo = location.modeInfo;
            const wantIconForDark = true;   // Always true, since pin background will always be dark (coloured).
            const wantLocalIcon = !!modeInfo.identifier &&
                (modeInfo.identifier.startsWith("me_car-s") || modeInfo.identifier.startsWith("cy_bic-s"));
            transIcon =
                <img src={TransportUtil.getTransIcon(modeInfo,
                    {
                        isRealtime: false,
                        onDark: wantIconForDark,
                        useLocal: wantLocalIcon
                    })} />
            invertedWrtMode = !wantLocalIcon && isRemoteIcon(modeInfo);
        }
        const classes = this.props.classes;
        const icon = transIcon &&
            <div className={classNames(classes.icon, invertedWrtMode && classes.iconInverted)}>
                {transIcon}
            </div>;
        return <div className={classes.main}
            id={this.id}>
            <IconPin className={classes.iconPin} />
            {icon}
        </div>;
    }
}

export default connect((config: TKUIConfig) => config.TKUIMapLocationIcon, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

export { TKUIMapLocationIcon as TKUIMapLocationIconRaw, config as tKUIMapLocationIconConfig }