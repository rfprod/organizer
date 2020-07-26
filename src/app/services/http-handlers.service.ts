import { HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppHttpHandlersService {
  public handleError<T>(error: HttpHeaderResponse & { message: string }, caught: Observable<T>) {
    const errMsg = error.message
      ? error.message
      : error.status
      ? `${error.status} - ${error.statusText}`
      : 'Server error';
    console.error(errMsg);
    return caught;
  }
}
