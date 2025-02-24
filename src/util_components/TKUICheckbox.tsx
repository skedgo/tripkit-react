import React from 'react';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import { colorWithOpacity, TKUITheme } from "../jss/TKUITheme";

const CheckboxStyled = ({ theme, ...props }: CheckboxProps & { theme: TKUITheme }) => {
    return <Checkbox color="default" sx={{ color: colorWithOpacity(theme.colorPrimary, .5), '&.Mui-checked': { color: theme.colorPrimary } }} {...props} />;
};

export default CheckboxStyled;