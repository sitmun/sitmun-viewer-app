import { DescriptionMaxLengthPipe } from './description-max-length.pipe';

describe('DescriptionMaxLengthPipe', () => {
  it('create an instance', () => {
    const pipe = new DescriptionMaxLengthPipe();
    expect(pipe).toBeTruthy();
  });
});
