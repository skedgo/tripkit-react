import * as React from "react";
import Segment from "../model/trip/Segment";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import DateTimeUtil from "../util/DateTimeUtil";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import TKUIMapPopup from "./TKUIMapPopup";
import genStyles from "../css/GenStyle.css";
import {TranslationFunction} from "../i18n/TKI18nProvider";

export interface IProps {
    segment: Segment;
    onLocationAction?: () => void;
    t: TranslationFunction;
}

interface IState {
    interchangeUrl?: string;
}

class SegmentPopup extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const t = this.props.t;
        const title = segment.arrival ?
            t("Arrive.X.at.X", {
                0: segment.to.getDisplayString(),
                1: DateTimeUtil.format(segment.endTime, DateTimeUtil.timeFormat(false))
            }) : segment.getAction();
        const subtitle = !segment.arrival ?
            (segment.isFirst() ? t("To.X", {0: segment.to.getDisplayString()}) : t("From.X", {0: segment.from.getDisplayString()})) : undefined;
        return (
            <TKUIMapPopup
                title={title}
                subtitle={subtitle}
                renderMoreInfo={this.state.interchangeUrl ?
                    () => <div style={{...genStyles.link,   // TODO: hover rule will not work.
                        borderTop: '1px solid #ECEBEB',
                        marginTop: '7px',
                        paddingTop: '7px'} as any}
                               onClick={() => window.open(this.state.interchangeUrl,'_blank')}
                    >View stop map</div> : undefined
                }
                onAction={this.props.onLocationAction}
            />
        );
    }

    public componentDidMount(): void {
        if (this.props.segment.isPT() && this.props.segment.stopCode !== null) {
            RegionsData.instance.getRegionP(this.props.segment.from).then((region?: Region) => {
                if (!region) {
                    return;
                }
                StopsData.instance.getStopFromCode(region.name, this.props.segment.stopCode!)
                    .then((stopLocation: StopLocation) => {
                            if (stopLocation.url) {
                                this.setState({interchangeUrl: stopLocation.url});
                            }
                        }
                    )
            });
        }
    }
}

export default SegmentPopup;