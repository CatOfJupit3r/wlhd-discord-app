import { iRollSession, SecretMode } from '@typing/commands';
import { Command, iDiscordClient } from '@typing/typedefs';
import { isInteractionCreatedByGM } from '@utils';
import { ButtonInteraction, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder } from 'discord.js';
import { isDescriptor } from '../../lib/game';
import { createMainEmbed } from './components';
import { commandName } from './constants';
import { handleButtonInteraction } from './handlers';

const SESSION_TIMEOUT = 150000; // 2.5 minutes in milliseconds

export default [
    {
        built: new SlashCommandBuilder()
            .setName(commandName)
            .setDescription('Start a new group roll session')
            .addStringOption((option) =>
                option.setName('attribute').setDescription('Attribute to roll for').setRequired(true).addChoices(
                    { name: 'Strength', value: 'builtins:strength' },
                    { name: 'Dexterity', value: 'builtins:dexterity' },
                    { name: 'Will', value: 'builtins:will' },

                    { name: 'Reflexes', value: 'builtins:reflexes' },
                    { name: 'Caution', value: 'builtins:caution' },
                    { name: 'Persuasion', value: 'builtins:persuasion' },
                    { name: 'Medicine', value: 'builtins:medicine' },
                    { name: 'Athletics', value: 'builtins:athletics' }
                )
            )
            .addIntegerOption((option) =>
                option
                    .setName('dice-sides')
                    .setDescription('Number of sides on the dice')
                    .setMinValue(1)
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName('value-to-roll')
                    .setDescription('Value to roll for success')
                    .setMinValue(1)
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName('timer')
                    .setDescription('Timer in seconds (max 150)')
                    .setMinValue(5)
                    .setMaxValue(150)
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName('secret')
                    .setDescription('How to handle roll visibility')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Keep In Channel', value: SecretMode.KEEP_IN_CHANNEL },
                        { name: 'Reveal At End', value: SecretMode.REVEAL_AT_END },
                        { name: 'Regular', value: SecretMode.REGULAR }
                    )
            ) as SlashCommandBuilder,

        async handleCommand(client: iDiscordClient, interaction: ChatInputCommandInteraction) {
            const timer = interaction.options.getInteger('timer', false) ?? 150;
            const secret = (interaction.options.getString('secret') ?? SecretMode.REGULAR) as SecretMode;
            const diceSides = interaction.options.getInteger('dice-sides')!;
            const valueToRoll = interaction.options.getInteger('value-to-roll')!;
            const attribute = interaction.options.getString('attribute')!;
            if (!isDescriptor(attribute)) {
                await interaction.reply({
                    content: 'Invalid name for attribute',
                    ephemeral: true,
                });
                return;
            }

            // Create new session
            const session: iRollSession = {
                participants: [],
                timer,
                secret,
                channelId: interaction.channelId,

                context: {
                    shared: {
                        diceSides,
                        valueToRoll,
                        attribute,
                    },
                    addCharacter: {
                        tab: 0,
                    },
                },
            };

            const { embeds, components } = createMainEmbed({ timer, secret });

            const interactionResponse = await interaction.reply({
                embeds,
                components,
            });
            const reply = await interactionResponse.fetch();

            session.messageId = reply.id;
            client.rollSessions.set(reply.id, session);

            // Create collector for the message components
            const collector = reply.createMessageComponentCollector({
                time: SESSION_TIMEOUT,
                componentType: ComponentType.Button,
            });

            collector.on('end', async () => {
                if (client.rollSessions.has(reply.id)) {
                    if (await reply.fetch()) {
                        reply
                            .edit({
                                content: 'Group roll setup timed out.',
                                components: [],
                                embeds: [],
                            })
                            .then(() => {
                                client.rollSessions.delete(reply.id);
                                setTimeout(() => reply.delete(), 5000);
                            });
                    }
                }
            });

            collector.on('collect', async (interaction: ButtonInteraction) => {
                if (!interaction.isButton()) return;
                const isGm = await isInteractionCreatedByGM(interaction);
                if (!isGm) {
                    await interaction.reply({
                        content: 'Only users with the GM role can use these buttons.',
                        ephemeral: true,
                    });
                    return;
                }
                await handleButtonInteraction(client, interaction);
                return;
            });
        },
    },
] as Array<Command>;
