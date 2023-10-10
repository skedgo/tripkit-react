import * as React from "react";
import { Classes } from "jss";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../../jss/StyleHelper";
import { tKUIOccupancyInfoDefaultStyle } from "./TKUIOccupancyInfo.css";
import { OccupancyStatus } from "../../model/service/VehicleComponent";
import { ReactComponent as IconPassenger } from '../../images/ic-passenger.svg';
import classNames from "classnames";
import { TranslationFunction } from "../../i18n/TKI18nProvider";
import { connect, mapperFromFunction } from "../../config/TKConfigHelper";
import { TKComponentDefaultConfig } from "../../config/TKUIConfig";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    status: OccupancyStatus;
    brief?: boolean;
    tabIndex?: number;
}

interface IConsumedProps {
    t: TranslationFunction;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
    classes: Classes<keyof ITKUIOccupancyInfoStyle>
}

export interface IStyle {
    main: CSSProps<ITKUIOccupancyInfoProps>;
    passengers: CSSProps<ITKUIOccupancyInfoProps>;
    passengerSlot: CSSProps<ITKUIOccupancyInfoProps>;
    passenger: CSSProps<ITKUIOccupancyInfoProps>;
    text: CSSProps<ITKUIOccupancyInfoProps>;
}

export type ITKUIOccupancyInfoStyle = IStyle;
export type ITKUIOccupancyInfoProps = IProps;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIOccupancyInfo {...props} />,
    styles: tKUIOccupancyInfoDefaultStyle,
    classNamePrefix: "TKUIOccupancyInfo"
};

class TKUIOccupancyInfo extends React.Component<IProps, {}> {

    private static toSlots(status: OccupancyStatus): number {
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

    private static getText(status: OccupancyStatus, t: TranslationFunction): string {
        switch (status) {
            case OccupancyStatus.EMPTY: return t("Empty");
            case OccupancyStatus.MANY_SEATS_AVAILABLE: return t("Many.seats.available");
            case OccupancyStatus.FEW_SEATS_AVAILABLE: return t("Few.seats.available");
            case OccupancyStatus.STANDING_ROOM_ONLY: return t("Standing.room.only");
            case OccupancyStatus.CRUSHED_STANDING_ROOM_ONLY: return t("Limited.standing.room.only");
            case OccupancyStatus.FULL: return t("Full");
            default: return t("Not.accepting.passengers");
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const brief = this.props.brief;
        const t = this.props.t;
        return (
            <div className={classes.main}
                aria-label={TKUIOccupancyInfo.getText(this.props.status, t)}
                tabIndex={this.props.tabIndex}
                role="none"
            >
                <div className={classes.passengers}>
                    <IconPassenger className={classNames(classes.passengerSlot,
                        TKUIOccupancyInfo.toSlots(this.props.status) > 0 ? classes.passenger : undefined)} />
                    <IconPassenger className={classNames(classes.passengerSlot,
                        TKUIOccupancyInfo.toSlots(this.props.status) > 1 ? classes.passenger : undefined)} />
                    <IconPassenger className={classNames(classes.passengerSlot,
                        TKUIOccupancyInfo.toSlots(this.props.status) > 2 ? classes.passenger : undefined)} />
                    <IconPassenger className={classNames(classes.passengerSlot,
                        TKUIOccupancyInfo.toSlots(this.props.status) > 3 ? classes.passenger : undefined)} />
                </div>
                {!brief ?
                    <div className={classes.text}>
                        {TKUIOccupancyInfo.getText(this.props.status, t)}
                    </div> : undefined
                }
            </div>
        );
    }
}

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));