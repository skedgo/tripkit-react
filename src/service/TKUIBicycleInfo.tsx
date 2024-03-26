import React, { FunctionComponent } from "react";
import {
    TKUIWithClasses,
    TKUIWithStyle
} from "../jss/StyleHelper";
import { tKUIBicycleInfoDefaultStyle } from "./TKUIBicycleInfo.css";
import { ReactComponent as IconWCAccessible } from '../../images/service/ic_wheelchair_accessible.svg';
import { ReactComponent as IconWCInaccessible } from '../../images/service/ic_wheelchair_inaccessible.svg';
import { ReactComponent as IconWCUnknown } from '../../images/service/ic_wheelchair_unknown.svg';
import { TKComponentDefaultConfig } from "../config/TKComponentConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKUIConfig } from "../config/TKUIConfig";

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

function getIcon(accessible?: boolean) {
    switch (accessible) {
        case true: return IconWCAccessible;
        case false: return IconWCInaccessible;
        default: return IconWCUnknown;
    }
}

function getText(accessible?: boolean): string {
    switch (accessible) {
        case true: return "Wheelchair accessible";
        case false: return "Wheelchair inaccessible";
        default: return "Wheelchair accessibility unknown";
    }
}

const TKUIBicycleInfo: FunctionComponent<IProps> = ({ accessible, brief, classes }) => {
    const WCIcon = getIcon(accessible);
    return (
        <div className={classes.main}>
            <WCIcon className={classes.icon} />
            {!brief ?
                <div className={classes.text}>
                    {getText(accessible)}
                </div> : undefined}
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIBicycleInfo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));