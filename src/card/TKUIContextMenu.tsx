import React, { useEffect } from 'react';
import genStyles from '../css/GenStyle.css';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { black, colorWithOpacity, TKUITheme, white } from '../jss/TKUITheme';

const tKUIContextMenuStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        ...genStyles.noShrink
    },
    menu: {
        background: white(0, theme.isDark),
        padding: '5px',
        boxShadow: theme.isLight ?
            '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' :
            '0 0 4px 0 rgba(255,255,255,.2), 0 6px 12px 0 rgba(255,255,255,.08)',
        ...genStyles.borderRadius(4)
    },
    item: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '5px',
        cursor: 'pointer',
        color: black(0, theme.isDark),
        whiteSpace: 'nowrap',
        '&:hover': {
            backgroundColor: colorWithOpacity(theme.colorPrimary, .08)
        }
    }
})

type IStyle = ReturnType<typeof tKUIContextMenuStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    items: {
        label: string;
        onClick: (e: any) => void;
    }[];
    position?: [number, number],    
    onRequestClose?: () => void;
    closeIfNotOverAfter?: number;
    // mouseLeaveDelay?: number;
}

let closeTimeout;

const TKUIContextMenu: React.FunctionComponent<IProps> =
    ({ items, position, closeIfNotOverAfter, onRequestClose, classes }) => {
        const visible = position !== undefined;
        useEffect(() => {
            // Close when clicking outside menu (notice the onClick={e => e.stopPropagation()} on menu div element)
            // Problem: this doesn't work when clicking on an element that also does e.stopPropagation(), as TKUICard.
            // To improve things maybe put a timout when it starts displaying to close it, and cancel it if mouse enter.
            const onWindowClick = () => onRequestClose?.();
            (window as any).addEventListener('click', onWindowClick);
            return () => {
                (window as any).removeEventListener('click', onWindowClick);
            };
        }, []);
        const cancelCloseTimeout = () => {
            if (closeTimeout !== undefined) {
                clearTimeout(closeTimeout);
                closeTimeout = undefined;
            }
        };
        useEffect(() => {
            if (visible && closeIfNotOverAfter) {
                closeTimeout = setTimeout(() => onRequestClose?.(), closeIfNotOverAfter);
            }
            return () => cancelCloseTimeout();
        }, [visible]);
        const menu =
            <div
                className={classes.menu}
                onMouseLeave={() => onRequestClose?.()}
                onClick={e => e.stopPropagation()}
                onMouseEnter={cancelCloseTimeout}
            >
                {items.map((item, i) =>
                    <div
                        className={classes.item}
                        onClick={e => {
                            item.onClick(e);
                            onRequestClose?.();
                        }}
                        key={i}
                    >
                        {item.label}
                    </div>
                )}
            </div>;
        return (
            visible ?
                <div
                    style={{
                        position: 'absolute',
                        left: position?.[0],
                        top: position?.[1]
                    }}
                >
                    {menu}
                </div> : null
        );        
    };


export default withStyles(TKUIContextMenu, tKUIContextMenuStyle);