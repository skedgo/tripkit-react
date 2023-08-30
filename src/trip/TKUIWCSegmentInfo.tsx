import React, { FunctionComponent } from "react";
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
import { black } from "../jss/TKUITheme";
import { Bar } from "react-chartjs-2";
import { CycleFriendliness, RoadTags, friendlinessColor, roadTagColor, roadTagDisplayS } from "../model/trip/Street";
import Util from "../util/Util";

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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TKUIWCSegmentInfo: FunctionComponent<IProps> = (props: IProps) => {
    const { value: segment, theme, classes } = props;
    const tagsToMetres: Record<RoadTags, number> = segment.streets!.reduce((tagsToMetres, street) => {
        const tag = street.roadTags[0] ?? "OTHER"; // The most relevant tag.
        if (tag) {
            tagsToMetres[tag] = (tagsToMetres[tag] ?? 0) + (street.metres ?? 0);
        }
        return tagsToMetres;
    }, {} as Record<RoadTags, number>);

    const tags = Object.keys(tagsToMetres).filter(tag => tag !== "OTHER").sort().concat(tagsToMetres["OTHER"] ? ["OTHER"] : []) as RoadTags[];

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
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
                        return TransportUtil.distanceToBriefString(value);
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
        labels: tags.map(tag => roadTagDisplayS(tag)),
        datasets: [{
            label: "miles",
            data: tags.map(tag => tagsToMetres[tag]),
            backgroundColor: tags.map(tag => roadTagColor(tag)),
            borderRadius: 4,
            barThickness: 10
        }]
    };

    const metres = segment.metres ?? 0;
    const metresSafe = segment.metresSafe ?? 0;
    const metresUnsafe = segment.metresUnsafe ?? 0;
    const metresDismount = segment.metresDismount ?? 0;

    const metresUnknown = metres - metresSafe - metresUnsafe - metresDismount;

    const friendlinessToMetres: Partial<Record<CycleFriendliness, number>> = {
        ...metresSafe ? { "FRIENDLY": metresSafe! } : {},
        ...metresUnsafe ? { "UNFRIENDLY": metresUnsafe! } : {},
        ...metresDismount ? { "DISMOUNT": metresDismount! } : {},
        ...metresUnknown ? { "UNKNOWN": metresUnknown! } : {}
    };


    const tagsF = Object.keys(friendlinessToMetres) as CycleFriendliness[];

    const chartDataF = {
        labels: tagsF.map(tag => Util.kebabCaseToSpaced(tag.toLowerCase())),
        datasets: [{
            label: "miles",
            data: tagsF.map(tag => friendlinessToMetres[tag]),
            backgroundColor: tagsF.map(tag => friendlinessColor(tag)),
            borderRadius: 4,
            barThickness: 10
        }]
    };

    return (
        <div className={classes.main}>
            <Bar options={options} data={chartData} />
            {/* {tagsF.length > 0 && <Bar options={options} data={chartDataF} />} */}
        </div>
    );

}

export default connect(
    (config: TKUIConfig) => config.TKUIWCSegmentInfo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));