import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { RequiredHeadersDto } from '../dto/required-headers.dto';

@Injectable()
export class RequiredHeadersPipe implements PipeTransform {
  transform(value: Record<string, unknown>) {
    const rawRequestId =
      (value['x-request-id'] as string | undefined) ||
      (value['X-Request-Id'] as string | undefined) ||
      (value['x-request-id'.toLowerCase()] as string | undefined);

    const dto = plainToInstance(RequiredHeadersDto, { requestId: rawRequestId });
    const errors = validateSync(dto, { whitelist: true });
    if (errors.length > 0) {
      throw new BadRequestException('Missing required header: x-request-id');
    }

    return dto;
  }
}
