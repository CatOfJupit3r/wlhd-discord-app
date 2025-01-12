import { iAddCharacterContext, iCharacterInfo, RollParticipant, SecretMode } from '@typing/commands';
import { addPostfix } from '@utils';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { commandIds } from './constants';

// SECTION: MAIN EMBED
const embedMainButtons = ({ disableStartRow }: { disableStartRow: boolean }) => {
    return [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(commandIds.START_ROLL)
                .setLabel('Start Roll')
                .setStyle(ButtonStyle.Success)
                .setDisabled(disableStartRow),
            new ButtonBuilder()
                .setCustomId('start-group-roll:cancel_roll')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(commandIds.ADD_CHARACTER)
                .setLabel('Add Character')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(commandIds.USE_PRESET)
                .setLabel('Use Preset')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(commandIds.SETTINGS).setLabel('Settings').setStyle(ButtonStyle.Secondary)
        ),
    ];
};

const mainEmbed = ({ timer, secret, participants }: { timer: number; secret: SecretMode; participants?: string }) => {
    return [
        new EmbedBuilder()
            .setTitle('Group Roll Setup')
            .setDescription('Add characters or players to the roll.\n' + '⚠️ This setup will expire in 2.5 minutes.')
            .addFields(
                { name: 'Timer', value: `${timer} seconds` },
                { name: 'Mode', value: secret },
                { name: 'Participants', value: participants ?? 'None yet' }
            )
            .setFooter({ text: 'Session will expire in 2.5 minutes' }),
    ];
};

export const createMainEmbed = ({
    timer,
    secret,
    participants,
    disableStartRow = true,
}: {
    timer: number;
    secret: SecretMode;
    participants?: string;
    disableStartRow?: boolean;
}) => {
    return {
        embeds: mainEmbed({ timer, secret, participants }),
        components: embedMainButtons({ disableStartRow }),
    };
};

// SECTION: ADD CHARACTER EMBED

export const embedAddCharacterButtons = (characters: Array<iCharacterInfo>, tab: number) => {
    // we can have up to 5 action rows.
    // let's make last row reserved for navigation: forward, current pos (disabled button), max pos, backward, exit
    // then 4 * 5 = 20 characters per tab. pretty good
    const maxTab = Math.floor(characters.length / 20);

    const forward = new ButtonBuilder()
        .setCustomId(addPostfix(commandIds.ADD_CHARACTER, 'forward'))
        .setLabel('Forward')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(tab >= maxTab);

    const backward = new ButtonBuilder()
        .setCustomId(addPostfix(commandIds.ADD_CHARACTER, 'backward'))
        .setLabel('Backward')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(tab <= 0);

    const currentTab = new ButtonBuilder()
        .setCustomId(addPostfix(commandIds.ADD_CHARACTER, 'current'))
        .setLabel(`${tab + 1}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const maxTabButton = new ButtonBuilder()
        .setCustomId(addPostfix(commandIds.ADD_CHARACTER, 'max'))
        .setLabel(`${maxTab + 1}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const exit = new ButtonBuilder()
        .setCustomId(addPostfix(commandIds.ADD_CHARACTER, 'exit'))
        .setLabel('Exit')
        .setStyle(ButtonStyle.Danger);
    const navigationRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        forward,
        currentTab,
        maxTabButton,
        backward,
        exit
    );

    const start = tab * 20;
    const end = start + 20;
    const buttons = characters.slice(start, end).map(({ descriptor, decorations: { name } }) => {
        return new ButtonBuilder()
            .setCustomId(addPostfix(commandIds.ADD_CHARACTER, 'select', descriptor))
            .setLabel(name)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);
    });
    const actionRows = buttons.reduce((acc, button, index) => {
        if (index % 5 === 0) {
            acc.push(new ActionRowBuilder<ButtonBuilder>());
        }
        acc[acc.length - 1].addComponents(button);
        return acc;
    }, [] as ActionRowBuilder<ButtonBuilder>[]);
    if (actionRows.length === 0) {
        actionRows.push(new ActionRowBuilder<ButtonBuilder>());
    } else if (actionRows.length > 4) {
        return [navigationRow];
    }

    return [...(actionRows ? actionRows : []), navigationRow];
};

const addCharacterEmbed = () => {
    return [
        new EmbedBuilder()
            .setTitle('Add Character')
            .setDescription('Select a character to add to the roll by pressing button.')
            .setFooter({ text: 'Select a character to add to the roll.' }),
    ];
};

export const createAddCharacterEmbed = ({ characters, tab }: iAddCharacterContext) => {
    return {
        embeds: addCharacterEmbed(),
        components: embedAddCharacterButtons(characters ?? [], tab),
    };
};

// SECTION: USE PRESET EMBED
// fetches all presets from API and displays info about it. if control info changes, then preset is cleared
// maybe in future i should add a way to

// SECTION: SETTINGS EMBED
// settings must have: add as preset, change timer, change secret mode, remove all participants

// SECTION: ROLL EMBED
export const createRollEmbed = (participant: RollParticipant) => {
    return {
        embeds: [
            new EmbedBuilder()
                .setTitle('Roll Request')
                .setDescription(`Time to roll for ${participant.descriptor}!`)
                .addFields({ name: 'Attribute Bonus', value: `${participant.attributeBonus || 0}` }),
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('roll').setLabel('Roll').setStyle(ButtonStyle.Primary)
            ),
        ],
    };
};
