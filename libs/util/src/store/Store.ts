import { BehaviorSubject, Observable } from 'rxjs';

// AKA "Model" or "State" or "Store"
export class Store<T> {
  // Observable source
  private _data: BehaviorSubject<T>;
  private data$: Observable<T>;

  constructor(initialData: Partial<T>) {
    // Create Observable stream
    this._data = new BehaviorSubject<T>(initialData as T);
    this.data$ = this._data.asObservable();
  }

  /** aka: select */
  public getStore(): Observable<T> {
    return this.data$;
  }

  /** aka: selectSnapshot/getState */
  public getSnapshot(): T {
    return this._data.getValue();
  }

  protected setState(d: T) {
    // console.log(`STORE STAGE CHANGE: `, d);
    this._data.next(d);
  }
}
