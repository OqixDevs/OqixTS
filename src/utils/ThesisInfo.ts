export interface ThesisInfo {
    name: string;
    handle: string;
    metadata: {
        'dc.contributor.author': Array<Author>;
    };
}

export interface Author {
    value: string;
}
