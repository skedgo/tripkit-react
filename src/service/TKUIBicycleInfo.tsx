import React, { FunctionComponent } from "react";
import {
    TKUIWithClasses,
    TKUIWithStyle
} from "../jss/StyleHelper";
import { tKUIBicycleInfoDefaultStyle } from "./TKUIBicycleInfo.css";
import { TKComponentDefaultConfig } from "../config/TKComponentConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKUIConfig } from "../config/TKUIConfig";
import TKUIIcon, { TKUIIconName } from "./TKUIIcon";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    accessible?: boolean;
    brief?: boolean;
    iconUrl?: string;
    iconMiniUrl?: string;
}

type IStyle = ReturnType<typeof tKUIBicycleInfoDefaultStyle>;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIBicycleInfoStyle = IStyle;
export type TKUIBicycleInfoProps = IProps;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBicycleInfo {...props} />,
    styles: tKUIBicycleInfoDefaultStyle,
    classNamePrefix: "TKUIBicycleInfo"
};

function getIcon(accessible?: boolean): React.ReactNode {
    switch (accessible) {
        case true: return <TKUIIcon iconName={TKUIIconName.bicycleAccessibleSmall} />;
        case false: return null;
        default: return null;
    }
}

function getText(accessible?: boolean): string {
    switch (accessible) {
        case true: return "Bicycle accessible";
        case false: return "Bicycle inaccessible";
        default: return "Bicycle accessibility unknown";
    }
}

const TKUIBicycleInfo: FunctionComponent<IProps> = ({ accessible, brief, classes }) => {
    const icon = getIcon(accessible);
    if (!icon) return null;
    return (
        <div className={classes.main}>
            {icon}
            {!brief ?
                <div className={classes.text}>
                    {getText(accessible)}
                </div> : undefined}
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIBicycleInfo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));