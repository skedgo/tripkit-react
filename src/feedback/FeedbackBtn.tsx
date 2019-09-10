import * as React from "react";
import Constants from "../util/Constants";
import Tooltip from "rc-tooltip";
import iconFeedback from "../images/ic-feedback.svg";
import copy from 'copy-to-clipboard';
import OptionsData from "../data/OptionsData";
import Util from "../util/Util";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";

interface IProps extends IRoutingResultsContext, IServiceResultsContext {}

interface IState {
    feedbackTooltip: boolean;
}

class FeedbackBtn extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            feedbackTooltip: false
        };
    }

    private getFeedback(): string {
        const optionsJson = Util.serialize(OptionsData.instance.get());
        const location = window.location;
        const plannerUrl = location.protocol + "//" + location.hostname
            + (location.port ? ":" + location.port : "") + location.pathname;
        return "webapp url: " + encodeURI(this.props.query.getGoUrl(plannerUrl)) + "\n\n"
            + "options: " + JSON.stringify(optionsJson) + "\n\n"
            + "satapp url: " +  (this.props.selected ? this.props.selected.satappQuery : "") + "\n\n"
            + "trip url: " +  (this.props.selected ? this.props.selected.temporaryURL : "");
    }

    public render(): React.ReactNode {
        return (
            <Tooltip
                overlay={"Feedback info copied to clipboard"}
                placement={"left"}
                overlayClassName="TripPlanner-feedbackTooltip"
                visible={this.state.feedbackTooltip}
            >
                <img src={Constants.absUrl(iconFeedback)} className="TripPlanner-feedbackBtn"
                     onClick={() => {
                         copy(this.getFeedback());
                         this.setState({feedbackTooltip: true});
                         setTimeout(() => this.setState({feedbackTooltip: false}), 3000);
                     }}
                     aria-hidden={true}
                     tabIndex={0}
                />
            </Tooltip>
        );
    }

    public componentDidUpdate(prevProps: IProps) {
        // TODO: Maybe create a separate non-displayable component called TKTracker that tracks app state and user
        // interaction, either hitting a tracking endpoint (e.g. for planned trips) or storing that info in local
        // storage to (possibly) be queried by feedback button.
        if (this.props.selected !== prevProps.selected) {
            PlannedTripsTracker.instance.selected = this.props.selected;
            PlannedTripsTracker.instance.scheduleTrack(true);
        }

        if (this.props.trips !== prevProps.trips) {
            PlannedTripsTracker.instance.trips = this.props.trips;
        }
    }
}

const Connector: React.SFC<{children: (props: Partial<IProps>) => React.ReactNode}> = (props: {children: (props: Partial<IProps>) => React.ReactNode}) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingResultsContext: IRoutingResultsContext) =>
                <ServiceResultsContext.Consumer>
                    {(serviceContext: IServiceResultsContext) =>
                        <FeedbackBtn {...routingResultsContext}
                                     {...serviceContext}
                        />}
                </ServiceResultsContext.Consumer>
            }
        </RoutingResultsContext.Consumer>
    );
};

const TKUIFeedbackBtn = (props: {}) =>
    <Connector>
        {(cProps: IProps) => <FeedbackBtn {...props} {...cProps}/>}
    </Connector>;

export default TKUIFeedbackBtn;