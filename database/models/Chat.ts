import { Model } from '@nozbe/watermelondb';
import { children, date, field } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';

export default class Chat extends Model {
  static table = 'chats';
  static associations: Associations = {
    messages: { type: 'has_many', foreignKey: 'chat_id' },
  };

  @field('name') name!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @children('messages') messages: any;
}
