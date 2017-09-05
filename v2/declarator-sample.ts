import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'usersFilter',
  pure: false
})
export class UsersFilter implements PipeTransform {
  transform(items: any[], filter: any, output?: any): any {
    if (!items) {
      return items;
    }
    if (output){
      output = items.filter((item: any, index: number) => {
        return filter.value === 'all' ? true : filter.value === item.circle;
      });
    }
    return items.filter((item: any, index: number) => {
      return filter.value === 'all' ? true : filter.value === item.circle;
    });
  }
}
