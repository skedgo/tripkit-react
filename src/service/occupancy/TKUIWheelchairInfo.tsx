import * as React from "react";
import {
    CSSProps,
    TKUIWithClasses,
    withStyles
} from "../../jss/StyleHelper";
import { tKUIWheelchairInfoDefaultStyle } from "./TKUIWheelchairInfo.css";
import { ReactComponent as IconWCInaccessible } from '../../images/service/ic_wheelchair_inaccessible.svg';
import { ReactComponent as IconWCUnknown } from '../../images/service/ic_wheelchair_unknown.svg';
import TKUIIcon, { TKUIIconName } from "../TKUIIcon";

export interface IClientProps {
    accessible?: boolean;
    brief?: boolean;
}

export interface IStyle {
    main: CSSProps<ITKUIWheelchairInfoProps>;
    icon: CSSProps<ITKUIWheelchairInfoProps>;
    text: CSSProps<ITKUIWheelchairInfoProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type ITKUIWheelchairInfoStyle = IStyle;
export type ITKUIWheelchairInfoProps = IProps;

function getText(accessible?: boolean): string {
    switch (accessible) {
        case true: return "Wheelchair accessible";
        case false: return "Wheelchair inaccessible";
        default: return "Wheelchair accessibility unknown";
    }
}

const TKUIWheelchairInfo: React.FunctionComponent<IProps> = ({ classes, brief, accessible }) => {

    function getIcon(accessible?: boolean): React.ReactNode {
        switch (accessible) {
            case true: return <TKUIIcon iconName={TKUIIconName.wheelchairAccessibleSmall} />;
            case false: return <IconWCInaccessible className={classes.icon} />;
            default: return <IconWCUnknown className={classes.icon} />;
        }
    }
    const icon = getIcon(accessible);
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

export default withStyles(TKUIWheelchairInfo, tKUIWheelchairInfoDefaultStyle);