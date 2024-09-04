import React, { FunctionComponent } from "react";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import TKUICard, { TKUICardClientProps } from "../card/TKUICard";
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { default as TKUISegmentOverview } from "./TKUISegmentOverview";
import { tKUITripOverviewViewDefaultStyle } from "./TKUITripOverviewView.css";
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { Visibility } from "../model/trip/SegmentTemplate";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import TKShareHelper from "../share/TKShareHelper";
import genStyles from "../css/GenStyle.css";
import TKUIShareAction from "../action/TKUIShareAction";
import { ReactComponent as IconNavigation } from "../images/ic-navigation.svg";
import TKUITripTime from "./TKUITripTime";
import TripRowTrack from "./TripRowTrack";
import TKUICardHeader from "../card/TKUICardHeader";

type IStyle = ReturnType<typeof tKUITripOverviewViewDefaultStyle>;
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * @ctype
     * @order 1
     */
    value: Trip;

    /**     
     * @ctype     
     * @order 2
     */
    selectedTripSegment?: Segment;

    /**     
     * @ctype     
     * @order 3
     */
    onTripSegmentSelected?: (segment: Segment) => void;

    /**
     * Function that will run when user hits the 'Alternative routes' button on a cancelled segment.
     * @ctype
     */
    onRequestAlternativeRoutes?: (segment: Segment) => void;

    /**
     * Allows to specify a list action buttons (JSX.Elements) associated with the trip, to be rendered on card header.
     * It receives the trip and the default list of buttons.
     * @ctype (trip: Trip, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Share Trip_ and _Add to favourites_ actions, which are instances of [](TKUIButton).
     */
    actions?: (trip: Trip, defaultActions: JSX.Element[]) => JSX.Element[];

    /**
     * Allows to specify a list of action buttons (JSX.Elements) associated with a segment, to be rendered on segment
     * detail. It receives the segment and the default list of buttons.
     * @ctype (segment: Segment, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Share Arrival_, if segment is the last one, which is an instance of [](TKUIButton).
     */
    segmentActions?: (segment: Segment, defaultActions: JSX.Element[]) => JSX.Element[];

    /**
     * @ctype TKUICard props
     */
    cardProps?: TKUICardClientProps;

    /**
     * @ignore
     */
    shouldFocusAfterRender?: boolean;

    /**
     * @ignore
     */
    doNotStack?: boolean;

    /**
     * @ignore
     */
    handleRef?: (ref: any) => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUITripOverviewViewProps = IProps;
export type TKUITripOverviewViewStyle = IStyle;

export const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripOverviewView {...props} />,
    styles: tKUITripOverviewViewDefaultStyle,
    classNamePrefix: "TKUITripOverviewView"
};

const TKUITripOverviewView: FunctionComponent<IProps> = props => {
    const { value: trip, cardProps, classes, onTripSegmentSelected, t, handleRef, shouldFocusAfterRender, doNotStack } = props;
    function getDefaultActions() {
        return [
            ...(onTripSegmentSelected ?
                [<TKUIButton text={t("Go")}
                    icon={<IconNavigation />}
                    type={TKUIButtonType.PRIMARY_VERTICAL}
                    onClick={() => onTripSegmentSelected?.(trip.getSegments(Visibility.IN_DETAILS)[0])}
                    key={"actionGo"}
                />] : []),
            <TKUIFavouriteAction
                favourite={FavouriteTrip.create(trip)}
                vertical={true}
            />,
            <TKUIShareAction
                title={t("Share.Trip")}
                message={""}
                link={() => TripGoApi.apiCallUrl(trip.saveURL, NetworkUtil.MethodType.GET).then((json: any) => json.url)}
                vertical={true}
                key={"actionShare"}
            />
        ];
    }
    function getDefaultSegmentActions(segment: Segment) {
        return segment.arrival ? [
            <TKUIShareAction title={props.t("Share.Arrival")}
                link={TKShareHelper.getShareSegmentArrival(segment)}
                message={""}
                buttonType={TKUIButtonType.PRIMARY_LINK}
                style={{
                    paddingLeft: 0,
                    ...genStyles.justifyStart
                }}
                key={"actionShareArrival"}
            />
        ] : []
    }
    const segments = trip.getSegments(Visibility.IN_DETAILS);
    const defaultActions = getDefaultActions();
    const actions = props.actions ? props.actions(trip, defaultActions) : defaultActions;
    const hideTimes = trip.hideExactTimes;
    const subHeader = () =>
        <div className={classes.header}>
            <div style={{ marginLeft: '10px' }}>
                <TripRowTrack value={trip} />
            </div>
            {actions &&
                <TKUIActionsView actions={actions} className={classes.actionsPanel} />}
        </div>;
    const segmentsAndArrival = segments.concat(trip.arrivalSegment);
    return (
        <TKUICard
            renderHeader={props =>
                <TKUICardHeader {...props}
                    title={!hideTimes &&
                        <TKUITripTime
                            styles={{
                                timePrimary: overrideClass({ lineHeight: '28px' }),
                                timeSecondary: overrideClass({ lineHeight: '28px' })
                            }}
                            value={trip}
                        />
                    }
                />}
            renderSubHeader={subHeader}
            handleRef={handleRef}
            ariaLabel={trip.mainSegment?.modeInfo ? trip.mainSegment.modeInfo.alt + " Trip Details" : undefined}
            shouldFocusAfterRender={shouldFocusAfterRender}
            doNotStack={doNotStack}
            {...cardProps}
        >
            <div className={classes.main}>
                {segmentsAndArrival.map((segment: Segment, index: number) => {
                    const defaultSegmentActions = getDefaultSegmentActions(segment);
                    const segmentActions = props.segmentActions ?
                        props.segmentActions(segment, defaultSegmentActions) : defaultSegmentActions;
                    return <TKUISegmentOverview
                        value={segment}
                        key={index}
                        actions={segmentActions}
                        onRequestAlternativeRoutes={props.onRequestAlternativeRoutes}
                        onClick={() => props.onTripSegmentSelected?.(segment)}
                    />;
                })}
            </div>
        </TKUICard>
    )
}

/**
 * Show details for a trip as an overview
 */

export default connect((config: TKUIConfig) => config.TKUITripOverviewView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));