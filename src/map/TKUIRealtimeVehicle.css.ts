import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIRealtimeVehicleProps, TKUIRealtimeVehicleStyle} from "./TKUIRealtimeVehicle";
import genStyles from "../css/GenStyle.css";

export const tKUIRealtimeVehicleDefaultStyle: TKUIStyles<TKUIRealtimeVehicleStyle, TKUIRealtimeVehicleProps> = {
    main: {
        height: '18px',
        width: '40px',
        position: 'relative',
        ...genStyles.flex
    },
    vehicleBackground: {
        ...genStyles.flex,
        ...genStyles.grow
    },
    bodyBackground: {
        backgroundColor: 'white',
        ...genStyles.grow
    },
    frontBackground: {
        width: '0',
        height: '0',
        display: 'inline-block',
        borderTop: '9px solid transparent',
        borderBottom: '9px solid transparent',
        borderLeft: '9px solid white'
    },
    vehicle: {
        position: 'absolute',
        ...genStyles.flex,
        height: '100%',
        width: '100%',
        padding: '2px'
    },
    body: {
        backgroundColor: (props: TKUIRealtimeVehicleProps) => (props.color ? props.color.toHex() : 'black'),
        ...genStyles.grow
    },
    front: {
        width: '0',
        height: '0',
        display: 'inline-block',
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        borderLeft: (props: TKUIRealtimeVehicleProps) => '7px solid ' + (props.color ? props.color.toHex() : 'black')
    },
    label: {
        position: 'absolute',
        top: '0',
        whiteSpace: 'nowrap',
        lineHeight: '18px',
        padding: '0 5px',
        overflow: 'hidden',
        color: 'white'
    }
};