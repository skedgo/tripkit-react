import * as React from "react";
import "./TPlannerDisclaimer.css";
interface IProps {
    className?: string;
    attribution?: boolean;
}
declare class TPlannerDisclaimer extends React.Component<IProps, {}> {
    static readonly REALTIME_URL: string;
    static readonly DISRUPTIONS_URL: string;
    static readonly FEEDBACK_URL: string;
    static readonly TRIPGO_URL: string;
    render(): React.ReactNode;
}
export default TPlannerDisclaimer;
