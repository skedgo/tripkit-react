import React from "react";
import Segment from "../model/trip/Segment";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIWCSegmentInfoDefaultStyle } from "./TKUIWCSegmentInfo.css";
import TransportUtil from "./TransportUtil";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { black, white } from "../jss/TKUITheme";
import { Bar } from "react-chartjs-2";
import { roadTagColor } from "../model/trip/Street";

type IStyle = ReturnType<typeof tKUIWCSegmentInfoDefaultStyle>;

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIWCSegmentInfoProps = IProps;
export type TKUIWCSegmentInfoStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIWCSegmentInfo {...props} />,
    styles: tKUIWCSegmentInfoDefaultStyle,
    classNamePrefix: "TKUIWCSegmentInfo",
};

// ChartJS.register(
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     Title,
//     Tooltip,
//     Legend
// );
// 
// console.log("TKUIWCSegmentInfo imported!!");

class TKUIWCSegmentInfo extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const theme = this.props.theme;
        const segment = this.props.value;
        const metres = segment.metres;
        const metresSafe = segment.metresSafe;
        const metresUnsafe = segment.metresUnsafe;
        const metresDismount = segment.metresDismount ? segment.metresDismount : 0;
        if (metres === undefined || metresSafe === undefined || metresUnsafe === undefined) {
            return null;
        }
        const metresUnknown = metres - metresSafe - metresUnsafe;
        const safePct = ((metresSafe / metres) * 100);
        const unsafePct = ((metresUnsafe / metres) * 100);
        const dismountPct = ((metresDismount / metres) * 100);
        const unknownPct = ((metresUnknown / metres) * 100);
        const classes = this.props.classes;
        const barWidthPct = .8;

        const options = {
            indexAxis: 'y' as const,
            responsive: true,
            // maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        color: black(1, theme.isDark)
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: black(1, theme.isDark),
                        callback: function (value, index, ticks) {
                            return value + " miles";
                        },
                        // stepSize: 1,
                        count: 3,
                        precision: 1
                    },
                    grid: {
                        color: black(3, theme.isDark)
                    }
                },
                y: {
                    ticks: {
                        color: black(1, theme.isDark)
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };

        const chartData = {
            labels: ["Cycle Network", "Cycle Track", "Cycle Lane", "Side Road", "Main Road"],
            datasets: [{
                label: "miles",
                data: [2, 1.2, .6, .5, .4],
                backgroundColor: [roadTagColor("CYCLE-NETWORK"), roadTagColor("CYCLE-TRACK"), roadTagColor("CYCLE-LANE"), roadTagColor("SIDE-ROAD"), roadTagColor("MAIN-ROAD")],
                borderRadius: 4
            }]
        };

        return (
            <div className={classes.main}>
                {/* <Bar options={options} data={chartData} /> */}
                <div className={classes.references}>
                    {safePct > 0 &&
                        <div>
                            <div className={classes.safeRef} />
                            Friendly
                        </div>}
                    {unsafePct > 0 &&
                        <div>
                            <div className={classes.unsafeRef} />
                            Unfriendly
                        </div>}
                    {dismountPct > 0 &&
                        <div>
                            <div className={classes.dismountRef} />
                            Dismount
                        </div>}
                    {unknownPct > 0 &&
                        <div>
                            <div className={classes.unknownRef} />
                            Unknown
                        </div>}
                </div>
                <div className={classes.bar}>
                    <div className={classes.safeBar} style={{ width: safePct + "%" }} />
                    <div className={classes.unsafeBar} style={{ width: unsafePct + "%" }} />
                    <div className={classes.dismountBar} style={{ width: dismountPct + "%" }} />
                </div>
                <div className={classes.mtsLabels}>
                    {safePct > 0 &&
                        <div className={classes.safeMtsLabel}
                            style={{
                                flexGrow: 1 // Don't set a width percentage to use this label as escape for the other label widths. So it grows to the remaining space, 
                                            // which will ideally match the remaining percentage, but may be less if some of the other labels have percentages that are 
                                            // not enough to fit their content (labels will span to fit it's content, always).
                            }}>
                            {TransportUtil.distanceToBriefString(metresSafe)}
                        </div>}
                    {unsafePct > 0 &&
                        <div className={classes.unsafeMtsLabel} style={{ minWidth: unsafePct * barWidthPct + "%" }}>
                            {TransportUtil.distanceToBriefString(metresUnsafe)}
                        </div>}
                    {dismountPct > 0 &&
                        <div className={classes.dismountMtsLabel} style={{ minWidth: dismountPct * barWidthPct + "%" }}>
                            {TransportUtil.distanceToBriefString(metresDismount)}
                        </div>}
                    {unknownPct > 0 &&
                        <div className={classes.unknownMtsLabel} style={{ minWidth: unknownPct * barWidthPct + "%" }}>
                            {TransportUtil.distanceToBriefString(metresUnknown)}
                        </div>}
                </div>
            </div>
        );
    }

}

export default connect(
    (config: TKUIConfig) => config.TKUIWCSegmentInfo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));