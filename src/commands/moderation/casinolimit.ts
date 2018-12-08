/**
 * @file Moderation CasinoLimitCommand - Configure what the upper limit for any casino command should be
 *
 * **Aliases**: `cl`
 * @module
 * @category moderation
 * @name casinolimit
 * @example confmute 20000
 * @param {Number} Limit The new limit to set
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components';

export default class CasinoLimitCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'casinolimit',
            aliases: ['cl'],
            group: 'moderation',
            memberName: 'casinolimit',
            description: 'Configure what the upper limit for any casino command should be',
            format: 'Number',
            examples: ['casinolimit 20000'],
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'upperlimit',
                    prompt: 'What should the new casino upper limit be?',
                    type: 'integer',
                },
                {
                    key: 'lowerlimit',
                    prompt: 'What should the new casino lower limit be?',
                    type: 'integer',
                    default: 1,
                },
            ],
        });
    }

    public run (msg: CommandoMessage, { upperlimit, lowerlimit }: { upperlimit: number, lowerlimit: number }) {
        startTyping(msg);

        const casinoLimitEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        msg.guild.settings.set('casinoUpperLimit', upperlimit);
        msg.guild.settings.set('casinoLowerLimit', lowerlimit);

        casinoLimitEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Changed casino limits
                **Lower Limit:** \`${lowerlimit}\`
                **Upper Limit:** \`${upperlimit}\`
            `)
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, casinoLimitEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(casinoLimitEmbed);
    }
}
