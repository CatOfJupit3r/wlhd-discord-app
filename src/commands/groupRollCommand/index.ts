import { iRollSession, SecretMode } from '@typing/commands';
import { Command, iDiscordClient } from '@typing/typedefs';
import { dePostfixId } from '@utils';
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    ComponentType,
    ModalSubmitInteraction,
    SlashCommandBuilder,
} from 'discord.js';
import { createAddCharacterEmbed, createMainEmbed } from './components';
import { commandIds, commandName } from './constants';
import { createSessionTimeout, fetchCharacters, updateSessionEmbed } from './helpers';

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
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('secret')
                    .setDescription('How to handle roll visibility')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Keep In Channel', value: SecretMode.KEEP_IN_CHANNEL },
                        { name: 'Reveal At End', value: SecretMode.REVEAL_AT_END },
                        { name: 'Regular', value: SecretMode.REGULAR }
                    )
            ) as SlashCommandBuilder,

        async handleCommand(client: iDiscordClient, interaction: ChatInputCommandInteraction) {
            const timer = interaction.options.getInteger('timer', true);
            const secret = interaction.options.getString('secret') as SecretMode;

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

            const reply = await interaction.reply({
                embeds,
                components,
            });

            session.messageId = reply.id;
            client.rollSessions.set(reply.id, session);

            // Create timeout for this session
            createSessionTimeout(client, reply.id, SESSION_TIMEOUT);

            // Create collector for the message components
            const collector = reply.createMessageComponentCollector({
                time: SESSION_TIMEOUT,
                componentType: ComponentType.Button,
            });

            collector.on('end', () => {
                if (client.rollSessions.has(reply.id)) {
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
            });
        },
        async handleButton(client: iDiscordClient, interaction: ButtonInteraction) {
            const session = client.rollSessions.get(interaction.message.id);
            if (!session) {
                await interaction.reply({
                    content: 'This group roll session has expired.',
                    ephemeral: true,
                });
                return;
            }
            const { customId, postfix } = dePostfixId(interaction.customId);

            switch (customId) {
                case commandIds.ADD_CHARACTER: {
                    if (postfix) {
                        const [action = '', descriptor = ''] = postfix;
                        switch (action) {
                            case 'forward':
                                session.context.addCharacter.tab = Math.min(
                                    session.context.addCharacter.tab + 1,
                                    Math.floor(session.context.addCharacter.characters!.length / 5)
                                );
                                break;
                            case 'backward':
                                session.context.addCharacter.tab = Math.max(session.context.addCharacter.tab - 1, 0);
                                break;
                            case 'select':
                                if (descriptor) {
                                    const characterInfo = session.context.addCharacter.characters?.find(
                                        (c) => c.descriptor === descriptor
                                    );
                                    if (!characterInfo) {
                                        console.log('Character not found:', descriptor);
                                        await interaction.reply({
                                            content: 'Character not found.',
                                            ephemeral: true,
                                        });
                                        return;
                                    }
                                    const { attributeBonus, channelId, userId } = characterInfo;
                                    session.participants.push({
                                        descriptor,
                                        userId,
                                        channelId,
                                        attributeBonus,
                                        hasRolled: false,
                                        result: null,
                                    });
                                    console.log('Added character:', descriptor);
                                    await updateSessionEmbed({ interaction, session });
                                    return;
                                }
                                break;
                            case 'max':
                            case 'current':
                            default:
                                break;
                        }
                    }
                    const { addCharacter: context } = session.context;
                    if (!context.characters) {
                        context.characters = await fetchCharacters();
                    }
                    const { embeds, components } = createAddCharacterEmbed(context);
                    await interaction.update({
                        embeds,
                        components,
                    });
                    break;
                }
                case commandIds.START_ROLL: {
                    if (session.participants.length === 0) {
                        await interaction.reply({
                            content: 'Cannot start roll without participants!',
                            ephemeral: true,
                        });
                        return;
                    }
                    client.rollSessions.delete(interaction.message.id);
                    await interaction.message.delete();
                    break;
                }
                case commandIds.CANCEL_ROLL: {
                    client.rollSessions.delete(interaction.message.id);
                    await interaction.message.delete();
                    break;
                }
                case commandIds.USE_PRESET: {
                    // todo: add
                    break;
                }
                case commandIds.SETTINGS: {
                    // todo: add
                    break;
                }
                default:
                    console.log('Unknown button action:', customId);
            }
        },

        async handleModalSubmit(client: iDiscordClient, interaction: ModalSubmitInteraction) {
            // if (interaction.customId === 'start-group-roll:character_modal') {
            //     const session = client.rollSessions.get(interaction.message!.id!);
            //     if (!session) {
            //         await interaction.reply({
            //             content: 'This group roll session has expired.',
            //             ephemeral: true,
            //         });
            //         return;
            //     }
            //
            //     const descriptor = interaction.fields.getTextInputValue('start-group-roll:player-descriptor');
            //     session.participants.push({
            //         descriptor,
            //         hasRolled: false,
            //         result: null,
            //     });
            //
            //     await updateSessionEmbed({ interaction, session });
            //     await interaction.deferUpdate();
            // }
        },
    },
] as Array<Command>;
