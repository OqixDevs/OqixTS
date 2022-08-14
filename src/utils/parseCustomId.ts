export function parseCustomId(customId: string) {
    const slashIndex = customId.indexOf('-');
    if (slashIndex > -1) {
        customId = customId.substring(0, customId.indexOf('-'));
    }
    return customId;
}
