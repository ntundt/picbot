import * as strings from '../../strings.json';

export class LocaleString {
    protected strname: string;
    protected replace: any[];

    constructor(strname: string, ...args: any[]) {
        this.strname = strname;
        this.replace = args;
    }

    getLocalized(): string {
        let str = LocaleString.indexate(strings, this.strname);
        return str.replace(/{(\d+)}/g, (match: any, number: any) => {
            return typeof this.replace[number] !== 'undefined'
                ? this.replace[number]
                : match;
        }); 
    }

    static indexate(strings: any, index: string): string {
        let result: any = strings;
        index.split('.').forEach(indexTemp => {
            if (typeof result[indexTemp] === 'undefined') {
                return 'Undefined string';
            }
            result = result[indexTemp];
        });
        if (typeof result !== 'string') {
            return 'Undefined string';
        }
        return result;
    } 
}

export default function stringFormat(strname: string, ...args: any[]) {
    return strname.replace(/{(\d+)}/g, function (match: any, number: any) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
};

export function s(strname: string, ...args: any[]) {
    return new LocaleString(strname, ...args);
}