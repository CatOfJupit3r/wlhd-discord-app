import { Event } from '@typing/typedefs';
import { ActivityType, Events } from 'discord.js';

export default [
    {
        name: Events.InteractionCreate,
        execute: async (client, interaction) => {
            if (!interaction.isCommand()) return;
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                });
            }
        },
    },
    {
        name: Events.ClientReady,
        once: true,
        execute: async (client) => {
            if (!client.user) {
                console.error('Client user is undefined!');
                return;
            }
            client.user.setPresence({
                status: 'online',
                activities: [
                    {
                        name: 'with your feelings',
                        type: ActivityType.Playing,
                    },
                ],
            });
            console.log(`Logged in as ${client.user?.tag} <${client.user?.id}>`);
        },
    },
] as Array<Event>;
