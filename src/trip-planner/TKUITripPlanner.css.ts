import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle} from "./TKUITripPlanner";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";

export const tKUITripPlannerDefaultStyle: TKUIStyles<TKUITKUITripPlannerStyle, TKUITKUITripPlannerProps> = {
    main: {
        // ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
        //     minHeight: '236px'
        // }
    },
    queryPanel: {
        position: 'absolute',
        width: '450px',
        zIndex: '1001', // 1 above card modal container
        top: '10px',
        left: '10px',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            width: '450px',
            left: '10px'
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            width: '100%',
            top: '0',
            left: '0'
        }
    },
    contElementClass: {
        zIndex: '1000!important',
        // left: '-100%!important',
        // right: '100%!important',
        // left: '-50%!important',
        // right: '50%!important',
        left: '0!important',
        right: '0!important',
        overflowX: 'visible',
        top: '60px!important',
        // top: '0!important',
    },
    modalElementClass: {
        top: '0',
        // top: '30px',
        // top: '90%',
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '700px',
        // minHeight: 'calc(100% - 30px)',
        // minHeight: '567px',
        // minHeight: '607px',
        // height: '607px',
        // height: '547px',
        // height: '500px',

        height: '100%',
        // height: '550px',

        minHeight: '550px',

        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        textAlign: 'center',
        position: 'absolute',
        // left: '50%',
        // right: '-50%',
        // position: 'fixed',
        left: '0',
        right: '0',
    },
    contElemTouching: {
        marginTop: '-150px'
    },
    modalElementTouching: {
        marginTop: '150px'
    },
    modalMiddle: {
        top: '50%!important',
        // minHeight: '50%'
    },
    modalMinimized: {
        top: '90%!important',
        // minHeight: '10%'
    }
};