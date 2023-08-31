import React, { FunctionComponent } from "react";
import Segment from "../model/trip/Segment";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIStreetsChartDefaultStyle } from "./TKUIStreetsChart.css";
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
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';
import { black } from "../jss/TKUITheme";
import { Bar } from "react-chartjs-2";
import { CycleFriendliness, RoadTags, friendlinessColor, roadTagColor, roadTagDisplayS } from "../model/trip/Street";
import Util from "../util/Util";

type IStyle = ReturnType<typeof tKUIStreetsChartDefaultStyle>;

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIStreetsChartProps = IProps;
export type TKUIStreetsChartStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIStreetsChart {...props} />,
    styles: tKUIStreetsChartDefaultStyle,
    classNamePrefix: "TKUIStreetsChart",
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TKUIStreetsChart: FunctionComponent<IProps> = (props: IProps) => {
    const { value: segment, theme, classes } = props;
    const tagsToMetres: Record<RoadTags, number> = segment.streets!.reduce((tagsToMetres, street) => {
        const tag = street.roadTags[0] ?? "OTHER"; // The most relevant tag.
        if (tag) {
            tagsToMetres[tag] = (tagsToMetres[tag] ?? 0) + (street.metres ?? 0);
        }
        return tagsToMetres;
    }, {} as Record<RoadTags, number>);

    // tagsToMetres["A"] = 1000
    // tagsToMetres["B"] = 300
    // tagsToMetres["C"] = 500
    // tagsToMetres["D"] = 1500
    // tagsToMetres["E"] = 2000

    const tags = Object.keys(tagsToMetres).filter(tag => tag !== "OTHER").sort().concat(tagsToMetres["OTHER"] ? ["OTHER"] : []) as RoadTags[];

    const options: ChartOptions<"bar"> = {
        indexAxis: 'y' as const,
        responsive: true,        
        plugins: {
            legend: {
                display: false,
                labels: {
                    color: black(1, theme.isDark)
                }
            },
            tooltip: {
                callbacks: {
                    label: context => {
                        let label = '';
                        if (context.parsed.x !== null) {
                            label += TransportUtil.distanceToBriefString(context.parsed.x);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#3C3C4399',                    
                    callback: function (value, index, ticks) {
                        return value === 0 ? undefined : TransportUtil.distanceToBriefString(value as number);
                    },                    
                    count: 3,
                    precision: 1,
                    backdropColor: 'red'
                },
                grid: {
                    color: black(3, theme.isDark),
                    borderDash: [3,3],
                    drawBorder: false,
                    drawTicks: false
                }
            },
            y: {
                ticks: {
                    color: '#3C3C4399',
                    autoSkip: false
                },
                grid: {
                    display: false
                }
            }
        },
        maintainAspectRatio: false
    };

    // Tags chart

    const chartData: ChartData<"bar"> = {
        labels: tags.map(tag => roadTagDisplayS(tag)),
        datasets: [{
            label: "distance",
            data: tags.map(tag => tagsToMetres[tag]),
            backgroundColor: tags.map(tag => roadTagColor(tag)),
            borderRadius: 4,
            // barThickness: 10,            
            maxBarThickness: 10,
            barPercentage: .7,
            categoryPercentage: 1
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

    // Friendliness chart. In case we want to allow user to switch between charts.

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

    const chartHeight = tags.length * 20 + 40;  // 20 px per bar, 40 for padding and x axis ticks

    return (
        <div className={classes.main} style={{height: chartHeight}}>            
            <Bar options={options} data={chartData} />
            {/* {tagsF.length > 0 && <Bar options={options} data={chartDataF} />} */}
        </div>
    );

}

export default connect(
    (config: TKUIConfig) => config.TKUIStreetsChart, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));