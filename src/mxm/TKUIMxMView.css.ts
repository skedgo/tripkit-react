import {cardSpacing, queryWidth, TKUITheme} from "../jss/TKUITheme";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";

export const tKUIMxMViewDefaultStyle = (theme: TKUITheme) => ({
    trackIndexPanel: {
        position: 'absolute',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            width: queryWidth + 'px',
            top: cardSpacing() + 'px',
            left: cardSpacing() + 'px',
            zIndex: '1005' // above card modal container
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            width: '100%',
            top: '0',
            left: '0',
            padding: cardSpacing(false) + 'px ' + cardSpacing(false) + 'px 0 ' + cardSpacing(false) + 'px',
            zIndex: '1001' // below card modal container
        }
    }
});