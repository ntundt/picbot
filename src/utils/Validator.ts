export default class Validator {

    /**
     * Проверить, является ли строка валидным никнеймом Minecraft
     * @param nickname строка, которая может быть никнеймом
     * @returns true, если валидный, false, если невалидный
     */
    public static isMinecraftNickname(nickname: string) {
        return nickname.length >= 3 && nickname.length <= 16 && /^\w+$/i.test(nickname);
    }
    
}