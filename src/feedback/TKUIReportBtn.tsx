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

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    className?: string;
    tooltipClassName?: string;
    renderIcon?: () => JSX.Element;
    onClick?: (state: TKState) => void;
    onContextMenu?: (state: TKState) => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
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
    feedbackTooltip: boolean;
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

    constructor(props: IProps) {
        super(props);
        this.state = {
            feedbackTooltip: false
        };
    }

    public render(): React.ReactNode {
        const defaultAction = (state: TKState) => {
            copy(feedbackTextFromState(state));
            this.setState({feedbackTooltip: true});
            setTimeout(() => this.setState({feedbackTooltip: false}), 3000);
        };
        const icon = this.props.renderIcon ? this.props.renderIcon() : <IconFeedback/>;
        const onClick = this.props.onClick ? this.props.onClick : defaultAction;
        const onContextMenu = this.props.onContextMenu ? this.props.onContextMenu : defaultAction;
        const classes = this.props.classes;
        return (
            <TKUITooltip
                overlayContent={"Feedback info copied to clipboard"}
                placement={"left"}
                visible={this.state.feedbackTooltip}
            >
                <button className={classNames(this.props.className, classes.main)}
                        onClick={() => onClick(this.props.tKState)}
                        onContextMenu={(e: MouseEvent) => {
                            onContextMenu(this.props.tKState);
                            e.preventDefault();
                        }}
                        aria-hidden={true}
                        tabIndex={0}>
                    {icon}
                </button>
            </TKUITooltip>
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