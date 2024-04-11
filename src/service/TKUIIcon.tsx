import React, { FunctionComponent } from "react";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import TransportUtil from "../trip/TransportUtil";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUITheme } from "../jss/TKUITheme";
import Util from "../util/Util";

export enum TKUIIconName {
    bicycle = "bicycle",
    bicycleAccessibleMini = "bicycleMini",
    bicycleAccessibleSmall = "bicycleAccessibleSmall",
    wheelchairAccessibleSmall = "wheelchairAccessibleSmall",
    myWayRetailAgent = "myWayRetailAgent",
    waterFountain = "waterFountain",
    parkAndRide = "parkAndRide",
    kissAndRide = "kissAndRide"
}

function getDefaultIconUrl(iconName: TKUIIconName | string, isDark: boolean): string {
    switch (iconName) {
        case TKUIIconName.bicycle:
            return TransportUtil.getTransportIconLocal("bicycle", false, isDark);
        case TKUIIconName.bicycleAccessibleMini:
            return TransportUtil.getTransportIconLocal("bicycle-accessible-mini", false, isDark);
        case TKUIIconName.bicycleAccessibleSmall:
            return TransportUtil.getTransportIconLocal("bicycle-accessible-small");
        case TKUIIconName.wheelchairAccessibleSmall:
            return TransportUtil.getTransportIconLocal("wheelchair-accessible-small");
        case TKUIIconName.myWayRetailAgent:
            return TransportUtil.getTransportIconLocal("myway-retail-agent");
        case TKUIIconName.waterFountain:
            return TransportUtil.getTransportIconLocal("water-fountain-2");
        default:
            return TransportUtil.getTransportIconLocal(Util.camelCaseToKebab(iconName), false, isDark);
    }
}

function getSizeInPx(iconName: TKUIIconName | string): number | undefined {
    return iconName.toLocaleLowerCase().endsWith("mini") ? 12 :
        iconName.toLocaleLowerCase().endsWith("small") ? 16 : undefined;
}

const tKUIIconNameDefaultStyle = (theme: TKUITheme) => ({
});

type IStyle = ReturnType<typeof tKUIIconNameDefaultStyle>;

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    iconName: TKUIIconName | string;
    onDark?: boolean;
    className?: string;
    style?: React.CSSProperties;
    width?: number | string;
    height?: number | string;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIIconStyle = IStyle;
export type TKUIIconProps = IProps;

const config: TKComponentDefaultConfig<IProps, {}> = {
    render: props => <TKUIIcon {...props} />,
    styles: {},
    classNamePrefix: ""
};

const TKUIIcon: FunctionComponent<IProps> = ({ iconName, onDark, theme, className, style }) => {
    style = { width: getSizeInPx(iconName), height: getSizeInPx(iconName), ...style };
    return <img src={getDefaultIconUrl(iconName, onDark ?? theme.isDark)} className={className} style={style} aria-hidden={true} />;
}

export default connect((config: TKUIConfig) => config.TKUIIcon, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

export { TKUIIcon as TKUIIconBase, config as tKUIIconConfig }

export function iconNameByFacilityType(facilityType: string): TKUIIconName | undefined {
    switch (facilityType) {
        case "MyWay-Retail-Agent":
            return TKUIIconName.myWayRetailAgent;
        case "Water-Fountain":
            return TKUIIconName.waterFountain;
        default:
            return undefined;
    }
}