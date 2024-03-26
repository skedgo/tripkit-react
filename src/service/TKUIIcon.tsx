import React, { FunctionComponent } from "react";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import TransportUtil from "../trip/TransportUtil";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUITheme } from "../jss/TKUITheme";

export enum TKUIIconName {
    bicycle = "bicycle",
    bicycleMini = "bicycleMini"
}

function getDefaultIconUrl(iconName: TKUIIconName, isDark: boolean): string {
    switch (iconName) {
        case TKUIIconName.bicycle:
            return TransportUtil.getTransportIconLocal("bike", false, isDark);
        case TKUIIconName.bicycleMini:
            return TransportUtil.getTransportIconLocal("bike-mini", false, isDark);
    }
}

function getSizeInPx(iconName: TKUIIconName): number {
    return iconName.toLocaleLowerCase().endsWith("mini") ? 12 : 24;
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