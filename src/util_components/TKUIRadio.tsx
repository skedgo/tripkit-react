import React from 'react';
import Radio, { RadioProps } from '@mui/material/Radio';
import { colorWithOpacity, TKUITheme } from "../jss/TKUITheme";

const RadioStyled = ({ theme, ...props }: { theme: TKUITheme } & RadioProps) =>
    <Radio
        {...props}
        sx={{
            marginLeft: '0',
            width: '50px',
            color: colorWithOpacity(theme.colorPrimary, .5),
            '&.Mui-checked': {
                color: theme.colorPrimary
            },
        }}
    />;

export default RadioStyled;