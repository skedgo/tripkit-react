import React, {MouseEvent} from "react";
import {ReactComponent as IconFeedback} from '../images/ic-feedback.svg';
import copy from 'copy-to-clipboard';
import OptionsData from "../data/OptionsData";
import Util from "../util/Util";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";
import {TKState, default as TKStateConsumer} from "../config/TKStateConsumer";
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

export function feedbackTextFromState(state: TKState): string {
    const optionsJson = Util.serialize(OptionsData.instance.get());
    const location = window.location;
    const plannerUrl = location.protocol + "//" + location.hostname
        + (location.port ? ":" + location.port : "") + location.pathname;
    return "webapp url: " + encodeURI(TKShareHelper.getShareQuery(state.routingQuery, plannerUrl)) + "\n\n"
        + "options: " + JSON.stringify(optionsJson) + "\n\n"
        + "satapp url: " +  (state.selectedTrip ? state.selectedTrip.satappQuery : "") + "\n\n"
        + "trip url: " +  (state.selectedTrip ? state.selectedTrip.temporaryURL : "");
}

class TKUIReportBtn extends React.Component<IProps, IState> {

    private contextMenuHandlerIOS: ContextMenuHandler | undefined;

    constructor(props: IProps) {
        super(props);
        this.state = {
            actionMenuTooltip: false
        };
        this.contextMenuHandlerIOS = DeviceUtil.isIOS ? new ContextMenuHandler() : undefined;
    }

    public render(): React.ReactNode {
        const copyToClipboard = (state: TKState) => {
            // On iOS, copy from copy-to-clipboard just works if it's called associated to a recognized event, like
            // a click in our case.
            if (copy(feedbackTextFromState(state), {message: "Unable to copy"})) {
                onShowActionDone("Feedback info copied to clipboard");
            }
            this.setState({actionMenuTooltip: false});
        };
        const onShowActionDone = (msg: string) => {
            this.setState({actionDoneMessage: msg});
            setTimeout(() => this.setState({actionDoneMessage: undefined}), 3000);

        };
        const icon = this.props.renderIcon ? this.props.renderIcon() : <IconFeedback/>;
        const onClick = this.props.onClick ? this.props.onClick : copyToClipboard;
        const classes = this.props.classes;
        const onShowActionsMenu = (e: MouseEvent) => {
            this.setState({actionMenuTooltip: true});
            e.preventDefault && e.preventDefault(); // Since safari on iOS fails saying preventDefault is not defined.
        };
        this.contextMenuHandlerIOS && this.contextMenuHandlerIOS.setContextMenuHandler(onShowActionsMenu);
        const feedbackBtn = <button className={classNames(this.props.className, classes.main)}
                                    onClick={() => onClick(this.props.tKState)}
                                    aria-hidden={true}
                                    tabIndex={0}
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

    public componentDidMount() {
        // Close action button when clicking outside the action menu
        window.addEventListener("click", () => this.setState({actionMenuTooltip: false}));
        // Close action menu on escape
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.keyCode === 27) {
                if (this.state.actionMenuTooltip) {
                    this.setState({actionMenuTooltip: false});
                }
            }
        });
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