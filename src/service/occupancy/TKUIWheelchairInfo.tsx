import * as React from "react";
import {ClassNameMap} from "react-jss";
import {CSSProps, withStyleProp} from "../../jss/StyleHelper";
import {tKUIWheelchairInfoDefaultStyle} from "./TKUIWheelchairInfo.css";
import {ReactComponent as IconWCAccessible} from '../../images/service/ic_wheelchair_accessible.svg';
import {ReactComponent as IconWCInaccessible} from '../../images/service/ic_wheelchair_inaccessible.svg';
import {ReactComponent as IconWCUnknown} from '../../images/service/ic_wheelchair_unknown.svg';

export interface ITKUIWheelchairInfoProps {
    accessible?: boolean;
    brief?: boolean;
}

interface IProps extends ITKUIWheelchairInfoProps {
    classes: ClassNameMap<keyof ITKUIWheelchairInfoStyle>
}

export interface ITKUIWheelchairInfoStyle {
    main: CSSProps<ITKUIWheelchairInfoProps>;
    icon: CSSProps<ITKUIWheelchairInfoProps>;
    text: CSSProps<ITKUIWheelchairInfoProps>;
}

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

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUIWheelchairInfo");
    return (props: ITKUIWheelchairInfoProps) => {
        return <RawComponentStyled {...props} styles={tKUIWheelchairInfoDefaultStyle}/>;
    };
};

export default Connect(TKUIWheelchairInfo);