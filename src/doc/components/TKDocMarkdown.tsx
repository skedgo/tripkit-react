import React, { isValidElement } from 'react';
import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import stripHtmlComments from 'strip-html-comments';
import Link from 'react-styleguidist/lib/client/rsg-components/Link';
import Text from 'react-styleguidist/lib/client/rsg-components/Text';
import Para from 'react-styleguidist/lib/client/rsg-components/Para';
import MarkdownHeading from 'react-styleguidist/lib/client/rsg-components/Markdown/MarkdownHeading/MarkdownHeadingRenderer';
import List from 'react-styleguidist/lib/client/rsg-components/Markdown/List/ListRenderer';
import Blockquote from 'react-styleguidist/lib/client/rsg-components/Markdown/Blockquote/BlockquoteRenderer';
import PreBase from 'react-styleguidist/lib/client/rsg-components/Markdown/Pre/PreRenderer';
import Code from 'react-styleguidist/lib/client/rsg-components/Code';
import Checkbox from 'react-styleguidist/lib/client/rsg-components/Markdown/Checkbox/CheckboxRenderer';
import Hr from 'react-styleguidist/lib/client/rsg-components/Markdown/Hr/HrRenderer';
import Details from 'react-styleguidist/lib/client/rsg-components/Markdown/Details/DetailsRenderer';
import DetailsSummary from 'react-styleguidist/lib/client/rsg-components/Markdown/Details/DetailsSummaryRenderer';
import Table from 'react-styleguidist/lib/client/rsg-components/Markdown/Table/TableRenderer';
import TableHead from 'react-styleguidist/lib/client/rsg-components/Markdown/Table/TableHeadRenderer';
import TableBody from 'react-styleguidist/lib/client/rsg-components/Markdown/Table/TableBodyRenderer';
import TableRow from 'react-styleguidist/lib/client/rsg-components/Markdown/Table/TableRowRenderer';
import TableCell from 'react-styleguidist/lib/client/rsg-components/Markdown/Table/TableCellRenderer';
import {resolveRelativeLinks} from "../TKDocUtil";

const Pre = (props: any) => {
    if (isValidElement(props.children)) {
        // Avoid rendering <Code> inside <Pre>
        return <PreBase {...props.children.props} />;
    }
    return <PreBase {...props} />;
};
Pre.propTypes = {
    children: PropTypes.node,
};

export const baseOverrides = {
    a: {
        component: Link as React.SFC,
    },
    h1: {
        component: MarkdownHeading as React.SFC,
        props: {
            level: 1,
        },
    },
    h2: {
        component: MarkdownHeading as React.SFC,
        props: {
            level: 2,
        },
    },
    h3: {
        component: MarkdownHeading as React.SFC,
        props: {
            level: 3,
        },
    },
    h4: {
        component: MarkdownHeading as React.SFC,
        props: {
            level: 4,
        },
    },
    h5: {
        component: MarkdownHeading as React.SFC,
        props: {
            level: 5,
        },
    },
    h6: {
        component: MarkdownHeading as React.SFC,
        props: {
            level: 6,
        },
    },
    p: {
        component: Para as React.SFC,
        props: {
            semantic: 'p',
        },
    },
    em: {
        component: Text as React.SFC,
        props: {
            semantic: 'em',
        },
    },
    strong: {
        component: Text as React.SFC,
        props: {
            semantic: 'strong',
        },
    },
    ul: {
        component: List as React.SFC,
    },
    ol: {
        component: List as React.SFC,
        props: {
            ordered: true,
        },
    },
    blockquote: {
        component: Blockquote as React.SFC,
    },
    code: {
        component: Code as React.SFC,
    },
    pre: {
        component: Pre as React.SFC,
    },
    input: {
        component: Checkbox as React.SFC,
    },
    hr: {
        component: Hr as React.SFC,
    },
    table: {
        component: Table as React.SFC,
    },
    thead: {
        component: TableHead as React.SFC,
    },
    th: {
        component: TableCell as React.SFC,
        props: {
            header: true,
        },
    },
    tbody: {
        component: TableBody as React.SFC,
    },
    tr: {
        component: TableRow as React.SFC,
    },
    td: {
        component: TableCell as React.SFC,
    },
    details: {
        component: Details as React.SFC,
    },
    summary: {
        component: DetailsSummary as React.SFC,
    },
};

export const inlineOverrides = {
    ...baseOverrides,
    p: {
        component: Text,
    },
};

interface MarkdownProps {
    text: string;
    inline?: boolean;
}

export const Markdown: React.FunctionComponent<MarkdownProps> = ({ text, inline }) => {
    const overrides = inline ? inlineOverrides : baseOverrides;
    return compiler(stripHtmlComments(resolveRelativeLinks(text)), { overrides, forceBlock: true });
};

Markdown.propTypes = {
    text: PropTypes.string.isRequired,
    inline: PropTypes.bool,
};

export default Markdown;