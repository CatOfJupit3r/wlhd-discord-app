import { Command } from '@typing/typedefs';
import { SlashCommandBuilder } from 'discord.js';

export default [
    {
        built: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
        execute: async (interaction) => {
            await interaction.reply('Pong!');
        },
    },
] as Array<Command>;
