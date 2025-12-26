import { IsArray, ArrayNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateWebhookConfigDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  storeIds: string[];

  @IsString()
  @IsUrl()
  callbackUrl: string;
}
