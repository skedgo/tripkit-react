import React, { useState, useEffect, FunctionComponent } from 'react';
import * as CSS from 'csstype';
import NetworkUtil from '../util/NetworkUtil';

const InlineSVG: FunctionComponent<{ url: string, style?: CSS.Properties, className?: string }> = ({ url, style, className }) => {
    const [svgContent, setSvgContent] = useState('');
    useEffect(() => {
        NetworkUtil.fetch(url, {}, true)
            .then((data) => setSvgContent(data))
            .catch((error) => console.error('Error fetching SVG:', error));
    }, [url]);

    return (
        <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={style}
            className={className}
        />
    );
}

export default InlineSVG;
