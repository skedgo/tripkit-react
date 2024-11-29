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
import TKUIIcon from "../service/TKUIIcon";
import CarParkLocation from "../model/location/CarParkLocation";
import Util from "../util/Util";
import SchoolLocation from "../model/location/SchoolLocation";
import TKUIInlineSVG from "../util_components/TKUIInlineSVG";
import { genClassNames } from "../css/GenStyle.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    from?: boolean;
    imgHtml?: string;
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
        const { location, imgHtml, classes } = this.props;
        let transIcon: React.ReactNode;
        let invertedWrtMode = false;
        if (imgHtml) {
            return (
                <div className={classes.main} id={this.id}>
                    <IconPin className={classes.iconPin} />
                    <div
                        className={classNames(classes.icon, genClassNames.svgLastPathFillCurrColor)}
                        style={{ color: 'white' }} dangerouslySetInnerHTML={{ __html: imgHtml }}></div>
                </div>
            );
        }
        if (location instanceof FacilityLocation) {
            transIcon = <TKUIIcon iconName={Util.kebabCaseToCamel(location.facilityType.toLowerCase())} onDark={false} />;
        } else if (location instanceof CarParkLocation && (location.carPark.parkingType === "PARK_AND_RIDE" || location.carPark.parkingType === "KISS_AND_RIDE")) {
            transIcon = <TKUIIcon iconName={Util.upperCaseToKebab(location.carPark.parkingType)} onDark={false} />;
        } else if (location instanceof SchoolLocation) {
            transIcon = <TKUIIcon iconName={"school-location"} onDark={false} />;
        } else if (location instanceof ModeLocation) {
            const modeInfo = location.modeInfo;
            const wantIconForDark = true;   // Always true, since pin background will always be dark (coloured).
            const wantLocalIcon = !!modeInfo.identifier &&
                (modeInfo.identifier.startsWith("me_car-s") || modeInfo.identifier.startsWith("cy_bic-s"));
            if (modeInfo.remoteIconIsTemplate && !wantLocalIcon && TransportUtil.getTransportIconRemote(modeInfo)) {
                transIcon = <TKUIInlineSVG url={TransportUtil.getTransportIconRemote(modeInfo)!} />;
            } else {
                transIcon =
                    <img src={TransportUtil.getTransIcon(modeInfo,
                        {
                            isRealtime: false,
                            onDark: wantIconForDark,
                            useLocal: wantLocalIcon
                        })} />
            }
            invertedWrtMode = !wantLocalIcon && isRemoteIcon(modeInfo);
        }
        const icon = transIcon &&
            <div className={classNames(classes.icon, invertedWrtMode && classes.iconInverted)}>
                {transIcon}
            </div>;
        return (
            <div className={classes.main} id={this.id}>
                <IconPin className={classes.iconPin} />
                {icon}
            </div>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUIMapLocationIcon, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

export { TKUIMapLocationIcon as TKUIMapLocationIconRaw, config as tKUIMapLocationIconConfig }