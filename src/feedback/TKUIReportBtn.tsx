import React, {MouseEvent} from "react";
import {ReactComponent as IconFeedback} from '../images/ic-feedback.svg';
import copy from 'copy-to-clipboard';
import Util from "../util/Util";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";
import TKStateConsumer from "../config/TKStateConsumer";
import {TKState} from "../config/TKState";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import {tKUIReportBtnDefaultStyle} from "./TKUIReportBtn.css";
import classNames from "classnames";
import TKShareHelper from "../share/TKShareHelper";
import TKUITooltip from "../card/TKUITooltip";
import ContextMenuHandler from "../util/ContextMenuHandler";
import DeviceUtil from "../util/DeviceUtil";
import {TKRequestStatus, default as TKUIWaitingRequest} from "../card/TKUIWaitingRequest";
import TKUserProfile from "../model/options/TKUserProfile";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    className?: string;
    tooltipClassName?: string;
    renderIcon?: () => JSX.Element;
    onClick?: (state: TKState) => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
    actionMenu: CSSProps<IProps>;
    actionItem: CSSProps<IProps>;
    actionIcon: CSSProps<IProps>;
}

interface IConsumedProps {
    tKState: TKState;
}

interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIReportBtnProps = IProps;
export type TKUIReportBtnStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIReportBtn {...props}/>,
    styles: tKUIReportBtnDefaultStyle,
    classNamePrefix: "TKUIReportBtn"
};

interface IState {
    actionDoneMessage?: string;
    actionMenuTooltip: boolean;
}

function feedbackTextFromState(state: TKState): string {
    const location = window.location;
    const plannerUrl = location.protocol + "//" + location.hostname
        + (location.port ? ":" + location.port : "");
    let feedbackS = "";
    feedbackS += "Share query url: " + encodeURI(TKShareHelper.getShareQuery(state.query, plannerUrl)) + "\n";
    feedbackS += "\n";
    // Remove sensible data from userProfile for feedback. Probably should remove customData (the sdk is not aware of
    // apiKeys field).
    const userProfile = Util.deserialize(JSON.parse(JSON.stringify(Util.serialize(state.userProfile))), TKUserProfile);
    if (userProfile.customData && userProfile.customData.apiKeys) {
        userProfile.customData.apiKeys = undefined;
    }
    feedbackS += "User profile: " + JSON.stringify(Util.serialize(userProfile)) + "\n";
    if (state.routingError) {
        feedbackS += "\n";
        // feedbackS += "Routing error: " + state.routingError.toLogString() + "\n";
        feedbackS += "Routing " + state.routingError + "\n";
    }
    if (state.stateLoadError) {
        feedbackS += "\n";
        feedbackS += "State load error " + state.stateLoadError + "\n";
        feedbackS += "Stack trace:\n\n"
            + "------------------------------------------------------\n\n" + state.stateLoadError.stack + "\n";
    }
    if (state.selectedTrip) {
        feedbackS += "\n";
        feedbackS += "Selected trip url: " +  (state.selectedTrip ? state.selectedTrip.temporaryURL : "")+ "\n";
        feedbackS += "Satapp url: " +  (state.selectedTrip ? state.selectedTrip.satappQuery : "") + "\n";
    }
    if (state.tripUpdateError) {
        feedbackS += "\n";
        feedbackS += "Trip update " + state.tripUpdateError.toString() + "\n";
    }
    if (state.stop) {
        feedbackS += "\n";
        feedbackS += "Timetable for stop: " + state.stop.code + "\n";
        feedbackS += "Timetable init time: " + state.timetableInitTime.valueOf() + "\n";
        feedbackS += "Share timetable url: " + TKShareHelper.getShareTimetable(state.stop) + "\n";
        if (state.selectedService) {
            feedbackS += "Selected service: " + state.selectedService.serviceTripID + "\n";
            feedbackS += "Share service url: " + TKShareHelper.getShareService(state.selectedService) + "\n";
        }
        if (state.serviceError) {
            feedbackS += "\n";
            feedbackS += "Service " + state.serviceError.toString() + "\n";
        }
    }
    return feedbackS;
}

class TKUIReportBtn extends React.Component<IProps, IState> {

    private contextMenuHandlerIOS: ContextMenuHandler | undefined;

    constructor(props: IProps) {
        super(props);
        this.state = {
            actionMenuTooltip: false
        };
        this.contextMenuHandlerIOS = DeviceUtil.isIOS ? new ContextMenuHandler() : undefined;
        this.showActionMenu = this.showActionMenu.bind(this);
    }

    private showActionMenu(show: boolean) {
        this.setState({actionMenuTooltip: show});
    }

    public render(): React.ReactNode {
        const copyToClipboard = (state: TKState) => {
            // On iOS, copy from copy-to-clipboard just works if it's called associated to a recognized event, like
            // a click in our case.
            if (copy(feedbackTextFromState(state), {message: "Unable to copy"})) {
                onShowActionDone("Feedback info copied to clipboard");
            }
            this.showActionMenu(false);
        };
        const onShowActionDone = (msg: string) => {
            this.setState({actionDoneMessage: msg});
            setTimeout(() => this.setState({actionDoneMessage: undefined}), 3000);

        };
        const icon = this.props.renderIcon ? this.props.renderIcon() : <IconFeedback/>;
        const onClick = this.props.onClick ? this.props.onClick : copyToClipboard;
        const classes = this.props.classes;
        const onShowActionsMenu = (e: MouseEvent) => {
            this.showActionMenu(true);
            e.preventDefault && e.preventDefault(); // Since safari on iOS fails saying preventDefault is not defined.
        };
        this.contextMenuHandlerIOS && this.contextMenuHandlerIOS.setContextMenuHandler(onShowActionsMenu);
        const feedbackBtn = <button className={classNames(this.props.className, classes.main)}
                                    onClick={() => onClick(this.props.tKState)}
                                    tabIndex={0}
                                    aria-label="Report issue"
                                    onContextMenu={this.contextMenuHandlerIOS ? this.contextMenuHandlerIOS.onContextMenu :
                                        onShowActionsMenu}
                                    onTouchStart={this.contextMenuHandlerIOS && this.contextMenuHandlerIOS.onTouchStart}
                                    onTouchCancel={this.contextMenuHandlerIOS && this.contextMenuHandlerIOS.onTouchCancel}
                                    onTouchEnd={this.contextMenuHandlerIOS && this.contextMenuHandlerIOS.onTouchEnd}
                                    onTouchMove={this.contextMenuHandlerIOS && this.contextMenuHandlerIOS.onTouchMove}
        >
            {icon}
        </button>;
        return (
            [
                <TKUITooltip
                    overlay={
                        <div className={classes.actionMenu}>
                            <div onClick={() => copyToClipboard(this.props.tKState)}
                                 className={classes.actionItem}
                            >
                                <IconFeedback className={classes.actionIcon}/>
                                Copy to clipboard
                            </div>

                        </div>
                    }
                    arrowColor={"transparent"}
                    placement={"leftBottom"}
                    visible={this.state.actionMenuTooltip}
                    onVisibleChange={(visible?: boolean) => !visible && this.showActionMenu(false)}
                    key={1}
                >
                    {feedbackBtn}
                </TKUITooltip>,
                <TKUIWaitingRequest
                    status={this.state.actionDoneMessage ? TKRequestStatus.success : undefined}
                    message={this.state.actionDoneMessage}
                    key={2}
                />
            ]
        );
    }

    public componentDidUpdate(prevProps: IProps) {
        // TODO: Maybe create a separate non-displayable component called TKTracker that tracks app state and user
        // interaction, either hitting a tracking endpoint (e.g. for planned trips) or storing that info in local
        // storage to (possibly) be queried by feedback button.
        const tKState = this.props.tKState;
        if (tKState.selectedTrip !== prevProps.tKState.selectedTrip) {
            PlannedTripsTracker.instance.selected = tKState.selectedTrip;
            if (tKState.userProfile.trackTripSelections) {
                PlannedTripsTracker.instance.scheduleTrack(true);
            }
        }

        if (tKState.trips !== prevProps.tKState.trips) {
            PlannedTripsTracker.instance.trips = tKState.trips;
        }
    }
}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> =
    (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <TKStateConsumer>
            {(state: TKState) =>
                props.children!({tKState: state})}
        </TKStateConsumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUIReportBtn, config, Mapper);
export {feedbackTextFromState};