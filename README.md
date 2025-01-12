# Walenholde Combat System — Discord Bot

This is a Discord bot for the Walenholde Combat System. It utilizes WLHD coordinator API to display various (limited)
info about your lobby

You can:

TBA:

1. Link Discord server to WLHD Lobby;
2. Create group rolls; (fetch desired attributes of characters and display those on frontend);
   a. `/group-roll @mention @mention @mention timer secret=keepInChannel/revealAtEnd/regular`. secret reveals results
   only in the end. Auto suggest descriptor for players (IF THEY ARE VALID);
   b. GET request on `/discord/:channelId/group-roll?participants=...,...`;
   c. { group-rolling: { user: discordUserId; linkedChannel: ...;
   characters: [{ descriptor: string, decorations: { name: string }, attribute: number }] } }
   d. send each player embed with buttons to roll. if not revealAtEnd, reveal it now.
   e. When all rolled and not keepInChannel, send modal with success and results of each roll.
3. Link Discord server channel to character and use it for character-only rolls and interactions;
   ?. Get Game Info in wiki-like form;
   ??. When Leveling system is implemented, add command to interact with it too.

[//]: # (Another option is to create modal which will allow admin to add characters dynamically)
Plans:

1. Use Discord commands as relays. Move most of the logic to the coordinator in `/discord/` route.
2. Add `primary` flag to characters. Primary characters will be used on rolls.
3. Add `discord` to model. Structure:

```typescript
{
    discord: {
        link: string | null; // JWT secret that keep info about ouath2 connection to guild
        characters: [{
            descriptor: string, // descriptor in characters collection
            channelId: string | null // Channel ID where character is linked. If none, sent as DM
        }]
    }
}
```

![goat](docs/goat.jpg)