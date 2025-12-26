// src/common/pipes/mongo-object-id.pipe.ts
import { BadRequestException, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export class MongoObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) {
      throw new BadRequestException('Identificador MongoDB inválido');
    }

    return value;
  }
}
