import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../../jss/StyleHelper";
import VehicleComponent, {OccupancyStatus} from "../../model/service/VehicleComponent";
import {connect, mapperFromFunction} from "../../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../../config/TKUIConfig";
import {tKUITrainOccupancyInfoDefaultStyle} from "./TKUITrainOccupancyInfo.css";
import {ReactComponent as IconHead} from '../../images/occupancy/ic-train-head.svg';
import {ReactComponent as IconCarriage} from '../../images/occupancy/ic-train-carriage.svg';
import classNames from "classnames";
import {ClassNameMap} from "react-jss";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    components: VehicleComponent[][];
}

interface IStyle {
    icon: CSSProps<IProps>;
    empty: CSSProps<IProps>;
    manySeatsAvailable: CSSProps<IProps>;
    fewSeatsAvailable: CSSProps<IProps>;
    standingRoomOnly: CSSProps<IProps>;
    crushedStandingRoomOnly: CSSProps<IProps>;
    full: CSSProps<IProps>;
    notAcceptingPassengers: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUITrainOccupancyInfoProps = IProps;
export type TKUITrainOccupancyInfoStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITrainOccupancyInfo {...props}/>,
    styles: tKUITrainOccupancyInfoDefaultStyle,
    classNamePrefix: "TKUITrainOccupancyInfo",
    randomizeClassNames: true // This needs to be true since multiple instances are rendered,
                              // each with a different badge color.
};

class TKUITrainOccupancyInfo extends React.Component<IProps, {}> {

    private getClass(status: OccupancyStatus | undefined, classes: ClassNameMap<keyof IStyle>): string {
        switch (status) {
            case OccupancyStatus.EMPTY: return classes.empty;
            case OccupancyStatus.MANY_SEATS_AVAILABLE: return classes.manySeatsAvailable;
            case OccupancyStatus.FEW_SEATS_AVAILABLE: return classes.fewSeatsAvailable;
            case OccupancyStatus.STANDING_ROOM_ONLY: return classes.standingRoomOnly;
            case OccupancyStatus.CRUSHED_STANDING_ROOM_ONLY: return classes.crushedStandingRoomOnly;
            case OccupancyStatus.FULL: return classes.full;
            default: return classes.notAcceptingPassengers;
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <div>
                {this.props.components.map((connComponents: VehicleComponent[], cci: number) =>
                    connComponents.map((component: VehicleComponent, i: number) =>
                        i < connComponents.length - 1 ?
                            <IconCarriage className={classNames(this.getClass(component.occupancy, classes), classes.icon)}
                                          key={cci + "-" + i}
                            /> :
                            <IconHead className={classNames(this.getClass(component.occupancy, classes), classes.icon)}
                                      key={cci + "-" + i}
                            />
                    )
                )}
            </div>
        );
    }

}

export default connect(
    (config: TKUIConfig) => config.TKUITrainOccupancyInfo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));