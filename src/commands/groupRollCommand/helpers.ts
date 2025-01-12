import { env } from '@configs';
import { iCharacterInfo, iRollSession } from '@typing/commands';
import { iDiscordClient } from '@typing/typedefs';
import { ButtonInteraction } from 'discord.js';
import { createMainEmbed } from './components';

export const fetchCharacters = async (): Promise<Array<iCharacterInfo>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
        {
            descriptor: 'warrior',
            decorations: {
                name: 'Warrior',
                description:
                    'A master of combat, the warrior is a melee fighter who uses heavy armor and powerful weapons to deal with enemies.',
                sprite: 'https://i.imgur',
            },
            userId: env.ADMIN_USER_ID,
            channelId: '875418720988721184',
            attributeBonus: 2,
        },
        {
            descriptor: 'mage',
            decorations: {
                name: 'Mage',
                description: 'A master of magic, the mage is a spellcaster who uses powerful spells to defeat enemies.',
                sprite: 'https://i.imgur',
            },
            userId: env.ADMIN_USER_ID,
            channelId: '875418720988721184',
            attributeBonus: 3,
        },
        {
            descriptor: 'rogue',
            decorations: {
                name: 'Rogue',
                description:
                    'A master of stealth, the rogue is a sneaky character who uses cunning and agility to defeat enemies.',
                sprite: 'https://i.imgur',
            },
            userId: env.ADMIN_USER_ID,
            attributeBonus: 1,
        },
        {
            descriptor: 'healer',
            decorations: {
                name: 'Healer',
                description:
                    'A master of healing, the healer is a support character who uses powerful spells to heal allies.',
                sprite: 'https://i.imgur',
            },
            attributeBonus: 4,
        },
        {
            descriptor: 'barbarian',
            decorations: {
                name: 'Barbarian',
                description:
                    'A master of rage, the barbarian is a melee fighter who uses brute strength to defeat enemies.',
                sprite: 'https://i.imgur',
            },
            userId: env.ADMIN_USER_ID,
            channelId: '875418720988721184',
            attributeBonus: 5,
        },
    ];
};

export async function updateSessionEmbed({
    interaction,
    session,
}: {
    interaction: ButtonInteraction;
    session: iRollSession;
}) {
    const { embeds, components } = createMainEmbed({
        timer: session.timer,
        secret: session.secret,
        participants:
            session.participants.length > 0
                ? session.participants
                      .map((p, i) => `${i + 1}. ${p.userId ? `<@${p.userId}>` : ''} ${p.descriptor}`)
                      .join('\n')
                : 'None yet',
        disableStartRow: session.participants.length === 0,
    });

    await interaction.update({
        embeds,
        components,
    });
}

export const processRolls = async (client: iDiscordClient, session: iRollSession) => {
    const channel = client.channels.cache.get(session.channelId);
    if (!channel?.isTextBased()) return;
    if (!channel?.isSendable()) return;

    const results = session.participants.map((p) => {
        if (p.result === null) {
            return `${p.descriptor} skipped their roll`;
        }
        return `${p.descriptor} rolled ${p.result}`;
    });

    await channel.send({
        content: `Roll Results:\n${results.join('\n')}`,
    });
};
