import { iDiscordClient } from '@typing/typedefs';
import { dePostfixId, isGM } from '@utils';
import { ButtonInteraction, ComponentType } from 'discord.js';
import { createAddCharacterEmbed, createRollEmbed } from './components';
import { commandIds } from './constants';
import { fetchCharacters, processRolls, rollDice, updateSessionEmbed } from './helpers';

export const handleButtonInteraction = async (client: iDiscordClient, interaction: ButtonInteraction) => {
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
                            Math.floor(session.context.shared.characters!.length / 5)
                        );
                        break;
                    case 'backward':
                        session.context.addCharacter.tab = Math.max(session.context.addCharacter.tab - 1, 0);
                        break;
                    case 'select':
                        if (descriptor) {
                            const characterInfo = session.context.shared.characters?.find(
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

                                mustRollToSucceed: session.context.shared.valueToRoll,
                                timesToThrow: 1,
                                result: null,
                                hasRolled: false,
                                dice: {
                                    amount: 1,
                                    sides: session.context.shared.diceSides,
                                },
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
            const { shared } = session.context;
            if (!shared.characters) {
                shared.characters = await fetchCharacters();
            }
            const { embeds, components } = createAddCharacterEmbed(session.context);
            await interaction.update({
                embeds,
                components,
            });
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
        case commandIds.START_ROLL: {
            if (session.participants.length === 0) {
                await interaction.reply({
                    content: 'Cannot start roll without participants!',
                    ephemeral: true,
                });
                return;
            }
            await interaction.message.edit({
                content: 'Roll started!',
                embeds: [],
                components: [],
            });
            for (const participant of session.participants) {
                try {
                    let target;
                    if (participant.channelId) {
                        target = await client.channels.fetch(participant.channelId);
                        if (!target?.isTextBased()) continue;
                        if (!target?.isSendable()) continue;
                    } else if (participant.userId) {
                        target = await client.users.fetch(participant.userId);
                    } else {
                        participant.result = rollDice(participant);
                        continue;
                    }

                    const rollEmbed = createRollEmbed(participant);
                    const message = await target.send(rollEmbed);

                    // Create collector for roll buttons
                    const collector = message.createMessageComponentCollector({
                        time: session.timer * 1000,
                        componentType: ComponentType.Button,
                    });

                    collector.on('collect', async (i) => {
                        const member = i.guild ? await i.guild.members.fetch(i.user.id) : null;
                        if (i.user.id !== participant.userId && !isGM(member)) {
                            await i.reply({
                                content: 'You cannot roll for this character.',
                                ephemeral: true,
                            });
                            return;
                        }

                        const roll = rollDice(participant);
                        participant.result = roll;
                        participant.hasRolled = true;

                        await i.update({
                            content: `Rolled: ${roll.finalRoll().toString()}`,
                            components: [],
                            embeds: [],
                        });

                        if (session.participants.every((p) => p.hasRolled)) {
                            await processRolls(client, session);
                        }
                    });

                    collector.on('end', () => {
                        if (!participant.hasRolled) {
                            participant.hasRolled = true;
                            participant.result = null;
                        }
                    });
                } catch (error) {
                    console.error(`Failed to send roll to participant:`, error);
                    participant.hasRolled = true;
                    participant.result = null;
                }
            }

            // Start the timer for the entire roll session
            setTimeout(async () => {
                const remainingParticipants = session.participants.filter((p) => !p.hasRolled);
                remainingParticipants.forEach((p) => {
                    p.hasRolled = true;
                    p.result = null;
                });

                if (session.participants.some((p) => p.hasRolled)) {
                    await processRolls(client, session);
                }
            }, session.timer * 1000);

            client.rollSessions.delete(interaction.message.id);
            break;
        }
        default:
            console.log('Unknown button action:', customId);
    }
};
