import { InjectOptions, InjectionToken, Injector, Type } from '@angular/core';

export class OpenModalInjector implements Injector {
  constructor(
    private parentInjector: Injector,
    private additionalTokens: WeakMap<any, any>
  ) {}

  get<T>(
    token: Type<T> | InjectionToken<T>,
    notFoundValue?: T,
    options?: InjectOptions
  ): T;
  // @ts-expect-error - Overload signature for flexible token types
  get(token: any, notFoundValue?: any);
  get(token: any, notFoundValue?: any, _flags?: any) {
    const value = this.additionalTokens.get(token);

    if (value) {
      return value;
    }

    return this.parentInjector.get<any>(token, notFoundValue);
  }
}
