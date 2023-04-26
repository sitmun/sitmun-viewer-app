import { Observable, Subject } from 'rxjs';

export interface ResultModal {
  action: string;
  element?: any;
}

export class OpenModalRef<R = any> {
  constructor() {}

  private readonly afterClosedSubject = new Subject<R>();
  afterClosed: Observable<R> = this.afterClosedSubject.asObservable();

  close(result?: R) {
    // @ts-ignore
    this.afterClosedSubject.next(result);
  }
}
