import { DummyClass } from '../src/index';

describe('Dummy test', () => {
  it('should be instantiable', () => {
    expect(new DummyClass()).toBeInstanceOf(DummyClass);
  });

  it('should have value true', () => {
    expect(new DummyClass().value).toBeTruthy();
  });
});
