import * as React from "react";
import {ClassNameMap} from "react-jss";
import {CSSProps, withStyleProp} from "../../jss/StyleHelper";
import {tKUIWheelchairInfoDefaultStyle} from "./TKUIWheelchairInfo.css";
import {OccupancyStatus} from "../../model/service/VehicleComponent";
import {ReactComponent as IconWCAccessible} from '../../images/service/ic_wheelchair_accessible.svg';
import {ReactComponent as IconWCInaccessible} from '../../images/service/ic_wheelchair_inaccessible.svg';
import {ReactComponent as IconWCUnknown} from '../../images/service/ic_wheelchair_unknown.svg';
import {ITKUIServiceViewProps} from "../TKUIServiceView";

export interface ITKUIWheelchairInfoProps {
    accessible?: boolean;
    brief?: boolean;
}

interface IProps extends ITKUIWheelchairInfoProps {
    classes: ClassNameMap<keyof ITKUIWheelchairInfoStyle>
}

export interface ITKUIWheelchairInfoStyle {
    main: CSSProps<ITKUIWheelchairInfoProps>;
    icon: CSSProps<ITKUIServiceViewProps>;
}

class TKUIWheelchairInfo extends React.Component<IProps, {}> {

    private static toSlots(status: OccupancyStatus): number  {
        switch (status) {
            case OccupancyStatus.EMPTY:
                return 0;
            case OccupancyStatus.MANY_SEATS_AVAILABLE:
            case OccupancyStatus.FEW_SEATS_AVAILABLE:
                return 1;
            case OccupancyStatus.STANDING_ROOM_ONLY:
                return 2;
            case OccupancyStatus.CRUSHED_STANDING_ROOM_ONLY:
                return 3;
            default:
                return 4;
        }
    }

    private static getText(status: OccupancyStatus): string {
        switch (status) {
            case OccupancyStatus.EMPTY: return "Empty";
            case OccupancyStatus.MANY_SEATS_AVAILABLE: return "Many seats available";
            case OccupancyStatus.FEW_SEATS_AVAILABLE: return "Few seats available";
            case OccupancyStatus.STANDING_ROOM_ONLY: return "Standing room only";
            case OccupancyStatus.CRUSHED_STANDING_ROOM_ONLY: return "Limited standing room only";
            case OccupancyStatus.FULL: return "Full";
            default: return "Not accepting passengers";
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const brief = this.props.brief;
        const accessible = this.props.accessible;
        const WCIcon = accessible === undefined ? IconWCUnknown : accessible ? IconWCAccessible : IconWCInaccessible;
        const wCText = accessible === undefined ? "Wheelchair accessibility unknown" :
            accessible ? "Wheelchair accessible" : "Wheelchair inaccessible";
        return (
            <div className={classes.main}>
                <WCIcon className={classes.icon}/>
                {!brief ? wCText : undefined}
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