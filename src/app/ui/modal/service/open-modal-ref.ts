import { Observable, Subject } from 'rxjs';

export interface ResultModal {
  action: string;
  element?: any;
}

export class OpenModalRef<R = any> {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  private readonly afterClosedSubject = new Subject<R>();
  afterClosed: Observable<R> = this.afterClosedSubject.asObservable();

  close(result?: R) {
    // @ts-expect-error - afterClosedSubject.next may not match all type constraints
    this.afterClosedSubject.next(result);
  }
}
