import * as React from "react";
import {
    CSSProps,
    TKUIWithClasses,
    withStyles
} from "../../jss/StyleHelper";
import {tKUIWheelchairInfoDefaultStyle} from "./TKUIWheelchairInfo.css";
import {ReactComponent as IconWCAccessible} from '../../images/service/ic_wheelchair_accessible.svg';
import {ReactComponent as IconWCInaccessible} from '../../images/service/ic_wheelchair_inaccessible.svg';
import {ReactComponent as IconWCUnknown} from '../../images/service/ic_wheelchair_unknown.svg';

export interface IClientProps {
    accessible?: boolean;
    brief?: boolean;
}

export interface IStyle {
    main: CSSProps<ITKUIWheelchairInfoProps>;
    icon: CSSProps<ITKUIWheelchairInfoProps>;
    text: CSSProps<ITKUIWheelchairInfoProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type ITKUIWheelchairInfoStyle = IStyle;
export type ITKUIWheelchairInfoProps = IProps;

class TKUIWheelchairInfo extends React.Component<IProps, {}> {

    private getIcon(accessible?: boolean) {
        switch (accessible) {
            case true: return IconWCAccessible;
            case false: return IconWCInaccessible;
            default: return IconWCUnknown;
        }
    }

    private getText(accessible?: boolean): string {
        switch (accessible) {
            case true: return "Wheelchair accessible";
            case false: return "Wheelchair inaccessible";
            default: return "Wheelchair accessibility unknown";
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const brief = this.props.brief;
        const accessible = this.props.accessible;
        const WCIcon = this.getIcon(accessible);
        return (
            <div className={classes.main}>
                <WCIcon className={classes.icon}/>
                {!brief ?
                    <div className={classes.text}>
                        {this.getText(accessible)}
                    </div> : undefined}
            </div>
        );
    }
}

export default withStyles(TKUIWheelchairInfo, tKUIWheelchairInfoDefaultStyle);