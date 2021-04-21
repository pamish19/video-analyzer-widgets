export interface IAction {
    label?: string;
    svgPath?: string;
    disabled?: boolean;
    type?: UIActionType;
    edit?: boolean;
}

export enum UIActionType {
    RENAME = 'RENAME',
    DELETE = 'DELETE'
}
