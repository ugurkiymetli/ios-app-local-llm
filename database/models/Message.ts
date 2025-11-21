import { Model } from '@nozbe/watermelondb';
import { date, field, relation } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';

export default class Message extends Model {
  static table = 'messages';
  static associations: Associations = {
    chats: { type: 'belongs_to', key: 'chat_id' },
  };

  @field('chat_id') chatId!: string;
  @field('role') role!: 'user' | 'assistant';
  @field('content') content!: string;
  @date('created_at') createdAt!: Date;

  @relation('chats', 'chat_id') chat: any;
}
