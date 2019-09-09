import { ASSET_BASE_PATH, EVERY_THREE_MINUTES } from '@utils/Constants';
import { deleteReminder, readAllReminders } from '@typeorm/DbInteractions';
import { ApplyOptions } from '@utils/Utils';
import { ClientSettings } from '@settings/ClientSettings';
import { stripIndents } from 'common-tags';
import { TextChannel } from 'discord.js';
import { Task, TaskOptions } from 'klasa';
import moment from 'moment';

@ApplyOptions<TaskOptions>({ name: 'sendReminderMessage', enabled: true })
export default class SendReminderMessageTask extends Task {
  async run() {
    try {
      const reminders = await readAllReminders();

      for (const reminder of reminders) {
        const remindTime = moment(reminder.date);
        const dura = moment.duration(remindTime.diff(moment()));

        if (dura.asMinutes() <= 0) {
          const user = await this.client.users.fetch(reminder.userId!);

          user.send({
            embed: {
              author: {
                iconURL: this.client.user!.displayAvatarURL({ format: 'png' }),
                name: 'Ribbon Reminders',
              },
              color: 10610610,
              description: reminder.content,
              thumbnail: {
                url:
                  `${ASSET_BASE_PATH}/ribbon/reminders.png`,
              },
            },
          });

          await deleteReminder(reminder.id);
        }
      }
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
      ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, an error occurred sending someone their reminder!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`
      );
    }
  }

  async init() {
    if (this.client.options.production) {
      this.ensureTask('sendReminderMessage', EVERY_THREE_MINUTES);
    }
  }

  private ensureTask(name: string, time: string): void {
    const schedules = this.client.settings!.get(ClientSettings.Schedules) as ClientSettings.Schedules;
    if (!schedules.some(task => task.taskName === name)) this.client.schedule.create(name, time, { catchUp: true });
  }
}