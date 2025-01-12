import { Event } from '@typing/typedefs';
import { ActivityType, Events } from 'discord.js';
import {
    handleAutocompleteCommand,
    handleButtonInteraction,
    handleInteractionCommand,
    handleModalSubmit,
    handleSelectMenuInteraction,
} from './coreEventInteractionHandlers';

export default [
    {
        name: Events.InteractionCreate,
        execute: async (client, interaction) => {
            // console.debug('Registered interaction:', interaction);
            try {
                if (interaction.isCommand()) {
                    await handleInteractionCommand(client, interaction);
                } else if (interaction.isAutocomplete()) {
                    await handleAutocompleteCommand(client, interaction);
                } else if (interaction.isButton()) {
                    await handleButtonInteraction(client, interaction);
                } else if (interaction.isModalSubmit()) {
                    await handleModalSubmit(client, interaction);
                } else if (interaction.isStringSelectMenu()) {
                    await handleSelectMenuInteraction(client, interaction);
                } else {
                    console.log('Unhandled interaction type:', interaction);
                }
            } catch (error) {
                console.error('Error handling interaction:', error);
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
