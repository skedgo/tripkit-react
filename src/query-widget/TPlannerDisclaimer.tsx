import * as React from "react";
import IconInfo from "-!svg-react-loader!../images/ic-info.svg";
import "./TPlannerDisclaimer.css";
import GATracker from "../analytics/GATracker";

interface IProps {
    className?: string;
    attribution?: boolean;
}

class TPlannerDisclaimer extends React.Component<IProps, {}> {

    public static readonly REALTIME_URL = "http://www.nxtbus.act.gov.au/#/liveDepartures";
    public static readonly DISRUPTIONS_URL = "https://www.transport.act.gov.au/news/service-alerts-and-updates";
    public static readonly FEEDBACK_URL = "https://accesscanberra--tst.custhelp.com/app/forms/transport_feedback";
    public static readonly TRIPGO_URL = "https://skedgo.com/tripgo/";

    public render(): React.ReactNode {
        const onClick = () => {
            GATracker.instance.send('link', 'click', 'jp feedback');
        };

        return (
            <div className={"TPlannerDisclaimer-infoPanel gl-flex" + (this.props.className ? " " + this.props.className : "")}>
                <IconInfo className="gl-charSpace gl-no-shrink" aria-hidden={true} focusable="false"/>
                <div className="TPlannerDisclaimer-disclaimer">
                    Trip planning is based on timetabled services.
                    Check real time services <a href={TPlannerDisclaimer.REALTIME_URL} target="_blank"
                                                aria-label={"Trip planning is based on timetabled services. Check real time services here"}>here</a> and
                    service disruptions <a href={TPlannerDisclaimer.DISRUPTIONS_URL} target="_blank"
                                           aria-label={"Check service disruptions here"}>here</a>. <a
                    aria-label="Feedback" target="_blank"
                    onClick={onClick}
                    href={TPlannerDisclaimer.FEEDBACK_URL}>Feedback</a>
                    {this.props.attribution &&
                    <><br/>Powered by <a aria-label="Powered by TripGo" target="_blank"
                                         href={TPlannerDisclaimer.TRIPGO_URL}>TripGo</a></>}
                </div>
            </div>
        );
    }
}

export default TPlannerDisclaimer;
