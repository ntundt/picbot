export enum AttachmentType {
    Photo,
    Video,
    Audio,
    Document,
    Other
};

export default interface IAttachment {
    
    getType(): AttachmentType;
    getTelegramType(): 'photo' | 'video';

    /**
     * Загрузить ВКонтакте, вернуть 
     */
    uploadToVK(): Promise<string>;

    getTelegramMedia(): Promise<any>;

    saveLocally(): Promise<string>;


}