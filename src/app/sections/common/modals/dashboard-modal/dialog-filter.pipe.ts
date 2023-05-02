import { Pipe, PipeTransform } from '@angular/core';
import { ApplicationDto, TerritoryDto } from '@api/services/common.service';

@Pipe({
  name: 'DialogFilter'
})
export class DialogFilterPipe implements PipeTransform {
  transform(value: any, input: string): any {
    if (input) {
      return value.filter((val: ApplicationDto | TerritoryDto) => {
        const lowerCase = val.name.toLowerCase();
        return lowerCase.indexOf(input.toLowerCase()) >= 0;
      });
    } else {
      return value;
    }
  }
}
