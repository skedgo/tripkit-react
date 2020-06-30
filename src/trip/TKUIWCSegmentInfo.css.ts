import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIWCSegmentInfoStyle, TKUIWCSegmentInfoProps} from "./TKUIWCSegmentInfo";
import genStyles from "../css/GenStyle.css";
import {CSSProperties} from "react-jss";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUIFriendlinessColors = {
    safe: '#1ec862',
    unsafe: '#f8e658',
    dismount: 'red',
    unknown: '#d8d8d8'
};

export const tKUIWCSegmentInfoDefaultStyle: TKUIStyles<TKUIWCSegmentInfoStyle, TKUIWCSegmentInfoProps> =
    (theme: TKUITheme) => ({
        main: {
            marginBottom: '10px'
        },
        references: {
            ...genStyles.flex,
            marginTop: '15px',
            '&>*': {
                ...genStyles.flex,
                ...genStyles.alignCenter,
                ...genStyles.fontS,
                ...theme.textColorGray,
            } as CSSProperties<TKUIWCSegmentInfoProps>
        },
        safeRef: {
            width: '15px',
            height: '15px',
            backgroundColor: tKUIFriendlinessColors.safe,
            ...genStyles.borderRadius(50, '%'),
            marginRight: '5px'
        },
        unsafeRef: {
            width: '15px',
            height: '15px',
            backgroundColor: tKUIFriendlinessColors.unsafe,
            ...genStyles.borderRadius(50, '%'),
            margin: '0 5px 0 10px'
        },
        dismountRef: {
            width: '15px',
            height: '15px',
            backgroundColor: tKUIFriendlinessColors.dismount,
            ...genStyles.borderRadius(50, '%'),
            margin: '0 5px 0 10px'
        },
        unknownRef: {
            width: '15px',
            height: '15px',
            backgroundColor: tKUIFriendlinessColors.unknown,
            ...genStyles.borderRadius(50, '%'),
            margin: '0 5px 0 10px'
        },
        bar: {
            height: '10px',
            backgroundColor: tKUIFriendlinessColors.unknown,
            marginTop: '10px',
            marginBottom: '5px',
            ...genStyles.flex
        },
        safeBar: {
            height: '100%',
            backgroundColor: tKUIFriendlinessColors.safe
        },
        unsafeBar: {
            height: '100%',
            backgroundColor: tKUIFriendlinessColors.unsafe
        },
        dismountBar: {
            height: '100%',
            backgroundColor: tKUIFriendlinessColors.dismount
        },
        mtsLabels: {
            ...genStyles.flex,
            ...genStyles.spaceBetween,
            ...genStyles.fontS
        },
        safeMtsLabel: {
            color: tKUIFriendlinessColors.safe,
            whiteSpace: 'nowrap',
            paddingRight: '10px',
            ...genStyles.noShrink
        },
        unsafeMtsLabel: {
            color: tKUIFriendlinessColors.unsafe,
            whiteSpace: 'nowrap',
            paddingRight: '10px',
            ...genStyles.noShrink
        },
        dismountMtsLabel: {
            color: tKUIFriendlinessColors.dismount,
            whiteSpace: 'nowrap',
            paddingRight: '10px',
            ...genStyles.noShrink
        },
        unknownMtsLabel: {
            color: tKUIFriendlinessColors.unknown,
            whiteSpace: 'nowrap',
            paddingRight: '10px',
            ...genStyles.noShrink
        }
    });
