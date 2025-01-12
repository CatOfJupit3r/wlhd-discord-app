import { Command } from '@typing/typedefs';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export default [
    {
        built: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
        handleCommand: async (_, interaction: CommandInteraction) => {
            await interaction.reply('Pong!');
        },
    },
] as Array<Command>;
