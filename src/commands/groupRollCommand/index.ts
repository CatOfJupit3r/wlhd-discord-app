import { iRollSession, SecretMode } from '@typing/commands';
import { Command, iDiscordClient } from '@typing/typedefs';
import { isInteractionCreatedByGM } from '@utils';
import { ButtonInteraction, ChatInputCommandInteraction, ComponentType, SlashCommandBuilder } from 'discord.js';
import { createMainEmbed } from './components';
import { commandName } from './constants';
import { handleButtonInteraction } from './handlers';

const SESSION_TIMEOUT = 150000; // 2.5 minutes in milliseconds

export default [
    {
        built: new SlashCommandBuilder()
            .setName(commandName)
            .setDescription('Start a new group roll session')
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

            // Create new session
            const session: iRollSession = {
                participants: [],
                timer,
                secret,
                channelId: interaction.channelId,
                initiator: interaction.user.id,
                createdAt: new Date(),
                context: {
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
