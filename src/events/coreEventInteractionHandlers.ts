import { iDiscordClient } from '@typing/typedefs';
import {
    AutocompleteInteraction,
    ButtonInteraction,
    CommandInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

export const handleInteractionCommand = async (client: iDiscordClient, interaction: CommandInteraction) => {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.handleCommand(client, interaction);
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        } else if (interaction.deferred) {
            await interaction.editReply({
                content: 'There was an error while executing this command!',
            });
        }
    }
};

export const handleAutocompleteCommand = async (client: iDiscordClient, interaction: AutocompleteInteraction) => {
    const command = client.commands.get(interaction.commandName);
    if (!command || !command.autocomplete) return;

    try {
        await command.autocomplete(interaction);
    } catch (error) {
        console.error('Error during autocomplete:', error);
        // Note: We don't send error responses for autocomplete
        // as it would interfere with the autocomplete UI
    }
};

export const handleButtonInteraction = async (client: iDiscordClient, interaction: ButtonInteraction) => {
    // Get the command name from the custom ID (format: commandName:action)
    const [commandName] = interaction.customId.split(':');
    const command = client.commands.get(commandName);

    if (!command?.handleButton) return;

    try {
        await command.handleButton(client, interaction);
    } catch (error) {
        console.error('Error handling button interaction:', error);
        await interaction.reply({
            content: 'There was an error processing this action!',
            ephemeral: true,
        });
    }
};

export const handleModalSubmit = async (client: iDiscordClient, interaction: ModalSubmitInteraction) => {
    // Get the command name from the modal custom ID (format: commandName:modalId)
    const [commandName] = interaction.customId.split(':');
    const command = client.commands.get(commandName);

    if (!command?.handleModalSubmit) return;

    try {
        await command.handleModalSubmit(client, interaction);
    } catch (error) {
        console.error('Error handling modal submission:', error);
        await interaction.reply({
            content: 'There was an error processing your input!',
            ephemeral: true,
        });
    }
};

export const handleSelectMenuInteraction = async (client: iDiscordClient, interaction: StringSelectMenuInteraction) => {
    // Get the command name from the custom ID (format: commandName:action)
    const [commandName] = interaction.customId.split(':');
    const command = client.commands.get(commandName);

    if (!command?.handleSelectMenu) return;

    try {
        await command.handleSelectMenu(client, interaction);
    } catch (error) {
        console.error('Error handling select menu interaction:', error);
        await interaction.reply({
            content: 'There was an error processing this action!',
            ephemeral: true,
        });
    }
};
