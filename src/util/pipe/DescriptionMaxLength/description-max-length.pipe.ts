import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'descriptionMaxLength'
})
export class DescriptionMaxLengthPipe implements PipeTransform {
  transform(value: string | any, maxLength = 100): string {
    if (value && value.length > maxLength) {
      return value.slice(0, maxLength) + '...';
    }
    return value || '';
  }
}
