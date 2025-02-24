import React, { forwardRef, useEffect } from 'react';
import Autocomplete from 'react-autocomplete';

const TKUIAutocomplete = forwardRef<any, any>((props, ref) => {
    useEffect(() => {
        if ((ref as any)?.current) {    // Override this implementation to avoid findDOMNode being called, which is removed from React 19.
            (ref as any).current.maybeScrollItemIntoView = () => { };
        }
    }, []);
    return (
        <Autocomplete {...props} ref={ref} />
    );
});

export default TKUIAutocomplete;