import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OrderDocument = WebhookConfig & Document;

@Schema({ timestamps: true })
export class WebhookConfig {
  @Prop({ type: [String], required: true })
  storeIds: string[];

  @Prop({ required: true })
  callbackUrl: string;
}
export const WebhookConfigSchema = SchemaFactory.createForClass(WebhookConfig);
