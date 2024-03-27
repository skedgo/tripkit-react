import React, { FunctionComponent } from "react";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import TransportUtil from "../trip/TransportUtil";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUITheme } from "../jss/TKUITheme";

export enum TKUIIconName {
    bicycle = "bicycle",
    bicycleAccessibleMini = "bicycleMini",
    bicycleAccessibleSmall = "bicycleAccessibleSmall",
    wheelchairAccessibleSmall = "wheelchairAccessibleSmall"
}

function getDefaultIconUrl(iconName: TKUIIconName, isDark: boolean): string {
    switch (iconName) {
        case TKUIIconName.bicycle:
            return TransportUtil.getTransportIconLocal("bicycle", false, isDark);
        case TKUIIconName.bicycleAccessibleMini:
            return TransportUtil.getTransportIconLocal("bicycle-accessible-mini", false, isDark);
        case TKUIIconName.bicycleAccessibleSmall:
            return TransportUtil.getTransportIconLocal("bicycle-accessible-small");
        case TKUIIconName.wheelchairAccessibleSmall:
            return TransportUtil.getTransportIconLocal("wheelchair-accessible-small");
        default:
            return TransportUtil.getTransportIconLocal("");
    }
}

function getSizeInPx(iconName: TKUIIconName): number {
    return iconName.toLocaleLowerCase().endsWith("mini") ? 12 :
        iconName.toLocaleLowerCase().endsWith("small") ? 16 : 24;
}

const tKUIIconNameDefaultStyle = (theme: TKUITheme) => ({
});

type IStyle = ReturnType<typeof tKUIIconNameDefaultStyle>;

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    iconName: TKUIIconName;
    className?: string;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIIconStyle = IStyle;
export type TKUIIconProps = IProps;

const config: TKComponentDefaultConfig<IProps, {}> = {
    render: props => <TKUIIcon {...props} />,
    styles: {},
    classNamePrefix: ""
};

const TKUIIcon: FunctionComponent<IProps> = ({ iconName, theme, className }) => {
    const iconSize = getSizeInPx(iconName);
    return <img src={getDefaultIconUrl(iconName, theme.isDark)} width={iconSize} height={iconSize} className={className} />;
}

export default connect((config: TKUIConfig) => config.TKUIIcon, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));