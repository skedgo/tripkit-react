import { TKUITheme } from "../jss/TKUITheme";

export const tKUIReorderListStyle = (theme: TKUITheme) => ({
    main: {
        margin: 0,
        padding: 0,
        position: 'relative',
        listStyle: 'none'
    },
    smoothDndContainer: {
        position: 'relative',
        minHeight: '30px',
        minWidth: '30px',
        '&$vertical $smoothDndDraggableWrapper': {
            overflow: 'hidden',
            display: 'block'
        }
    },
    vertical: {

    },
    smoothDndDraggableWrapper: {
        boxSizing: 'border-box',
        '&$animated': {
            transition: 'transform ease'
        }
    },
    animated: {

    },
    itemContainer: {
        position: 'relative'
    }
})