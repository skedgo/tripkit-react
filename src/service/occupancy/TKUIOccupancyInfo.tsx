import * as React from "react";
import {ClassNameMap} from "react-jss";
import {CSSProps, withStyleProp} from "../../jss/StyleHelper";
import {tKUIOccupancyInfoDefaultStyle} from "./TKUIOccupancyInfo.css";
import {OccupancyStatus} from "../../model/service/VehicleComponent";
import {ReactComponent as IconPassenger} from '../../images/ic-passenger.svg';
import classNames from "classnames";

export interface ITKUIOccupancyInfoProps {
    status: OccupancyStatus;
    brief?: boolean;
}

interface IProps extends ITKUIOccupancyInfoProps {
    classes: ClassNameMap<keyof ITKUIOccupancyInfoStyle>
}

export interface ITKUIOccupancyInfoStyle {
    main: CSSProps<ITKUIOccupancyInfoProps>;
    passengers: CSSProps<ITKUIOccupancyInfoProps>;
    passengerSlot: CSSProps<ITKUIOccupancyInfoProps>;
    passenger: CSSProps<ITKUIOccupancyInfoProps>;
    text: CSSProps<ITKUIOccupancyInfoProps>;
}

class TKUIOccupancyInfo extends React.Component<IProps, {}> {

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
        return (
            <div className={classes.main}>
                <div className={classes.passengers}>
                    <IconPassenger className={classNames(classes.passengerSlot,
                        TKUIOccupancyInfo.toSlots(this.props.status) > 0 ? classes.passenger : undefined)}/>
                    <IconPassenger className={classNames(classes.passengerSlot,
                        TKUIOccupancyInfo.toSlots(this.props.status) > 1 ? classes.passenger : undefined)}/>
                    <IconPassenger className={classNames(classes.passengerSlot,
                        TKUIOccupancyInfo.toSlots(this.props.status) > 2? classes.passenger : undefined)}/>
                    <IconPassenger className={classNames(classes.passengerSlot,
                        TKUIOccupancyInfo.toSlots(this.props.status) > 3 ? classes.passenger : undefined)}/>
                </div>
                {!brief ?
                    <div className={classes.text}>
                        {TKUIOccupancyInfo.getText(this.props.status)}
                    </div> : undefined
                }
            </div>
        );
    }
}

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUIOccupancyInfo");
    return (props: ITKUIOccupancyInfoProps) => {
        return <RawComponentStyled {...props} styles={tKUIOccupancyInfoDefaultStyle}/>;
    };
};

export default Connect(TKUIOccupancyInfo);