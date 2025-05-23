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
import { jSDocLinksToMD, resolveRelativeLinks } from "../TKDocUtil";

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
        component: Link as React.FunctionComponent,
    },
    h1: {
        component: MarkdownHeading as React.FunctionComponent,
        props: {
            level: 1,
        },
    },
    h2: {
        component: MarkdownHeading as React.FunctionComponent,
        props: {
            level: 2,
        },
    },
    h3: {
        component: MarkdownHeading as React.FunctionComponent,
        props: {
            level: 3,
        },
    },
    h4: {
        component: MarkdownHeading as React.FunctionComponent,
        props: {
            level: 4,
        },
    },
    h5: {
        component: MarkdownHeading as React.FunctionComponent,
        props: {
            level: 5,
        },
    },
    h6: {
        component: MarkdownHeading as React.FunctionComponent,
        props: {
            level: 6,
        },
    },
    p: {
        component: Para as React.FunctionComponent,
        props: {
            semantic: 'p',
        },
    },
    em: {
        component: Text as React.FunctionComponent,
        props: {
            semantic: 'em',
        },
    },
    strong: {
        component: Text as React.FunctionComponent,
        props: {
            semantic: 'strong',
        },
    },
    ul: {
        component: List as React.FunctionComponent,
    },
    ol: {
        component: List as React.FunctionComponent,
        props: {
            ordered: true,
        },
    },
    blockquote: {
        component: Blockquote as React.FunctionComponent,
    },
    code: {
        component: Code as React.FunctionComponent,
    },
    pre: {
        component: Pre as React.FunctionComponent,
    },
    input: {
        component: Checkbox as React.FunctionComponent,
    },
    hr: {
        component: Hr as React.FunctionComponent,
    },
    table: {
        component: Table as React.FunctionComponent,
    },
    thead: {
        component: TableHead as React.FunctionComponent,
    },
    th: {
        component: TableCell as React.FunctionComponent,
        props: {
            header: true,
        },
    },
    tbody: {
        component: TableBody as React.FunctionComponent,
    },
    tr: {
        component: TableRow as React.FunctionComponent,
    },
    td: {
        component: TableCell as React.FunctionComponent,
    },
    details: {
        component: Details as React.FunctionComponent,
    },
    summary: {
        component: DetailsSummary as React.FunctionComponent,
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
    return compiler(stripHtmlComments(jSDocLinksToMD(resolveRelativeLinks(text))), { overrides, forceBlock: true });
};

Markdown.propTypes = {
    text: PropTypes.string.isRequired,
    inline: PropTypes.bool,
};

export default Markdown;