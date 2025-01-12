import { ButtonInteraction, CommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';

export const createCommandIdFactory =
    (command: string) =>
    (subId: string, ...leafs: Array<string>) =>
        addPrefix(command, subId, ...leafs);
const addPrefix = (command: string, subId: string, ...leafs: Array<string>) =>
    `${command}:${subId}${leafs.length ? `.${leafs.join('.')}` : ''}`;
export const dePrefixId = (str: string): { command: string; action: string } => {
    const [command = '', action = '', ..._] = str.split(':');
    return { command, action };
};
export const addPostfix = (mainId: string, ...postfix: Array<string>) =>
    `${mainId}${postfix.length ? `.${postfix.join('.')}` : ''}`;
export const dePostfixId = (str: string): { customId: string; postfix: Array<string> } => {
    const [mainId = '', ...postfix] = str.split('.');
    return { customId: mainId, postfix };
};

export const isGM = (member: GuildMember | null) => {
    if (!member) return false;
    return (
        member.roles.cache.some((role) => role.name === 'GM') ||
        member.permissions.has(PermissionsBitField.Flags.Administrator)
    );
};

export const isInteractionCreatedByGM = async (interaction: CommandInteraction | ButtonInteraction) => {
    if (!interaction.guild) return false;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    return isGM(member);
};
