import { NgModule } from '@angular/core';
import { DescriptionMaxLengthPipe } from './DescriptionMaxLength/description-max-length.pipe';

@NgModule({
  declarations: [DescriptionMaxLengthPipe],
  exports: [DescriptionMaxLengthPipe]
})
export class SharedPipesModule {}
