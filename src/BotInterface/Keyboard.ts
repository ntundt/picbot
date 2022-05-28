import { LocaleString } from '../../src/utils/stringFormat';

export enum ButtonColor {
    green,
    red,
    default
}

function buttonColorToVKColor(input: ButtonColor): string {
    switch (input) {
        case ButtonColor.green:
            return 'positive';
        case ButtonColor.red:
            return 'negative';
        case ButtonColor.default:
            return 'primary';
    }
}

export class Keyboard {

    private Buttons: {
        text: string | LocaleString,
        payload: string, 
        color: ButtonColor
    }[][] = [[]];

    public addButton(text: string | LocaleString, payload: string, color: ButtonColor = ButtonColor.default) {
        this.Buttons[this.Buttons.length - 1].push({
            text, 
            payload, 
            color
        });
    }

    public addLine() {
        this.Buttons.push([]);
    }

    public getTelegramMarkup(): object {
        let obj = this.Buttons.map(buttonRow => {
            return buttonRow.map(button => {
                return {
                    text: (button.text instanceof LocaleString) ? button.text.getLocalized() : button.text,
                    callback_data: button.payload
                };
            })
        });
        return obj;
    }

    public getVKMarkup(): string {
        let obj = {
            inline: true,
            buttons: this.Buttons.map(buttonRow => {
                return buttonRow.map(button => {
                    return {
                        action: {
                            type: 'text',
                            payload: button.payload,
                            label: (button.text instanceof LocaleString) ? button.text.getLocalized() : button.text,
                        },
                        color: buttonColorToVKColor(button.color)
                    };
                })
            })
        };
        return JSON.stringify(obj);
    }

}