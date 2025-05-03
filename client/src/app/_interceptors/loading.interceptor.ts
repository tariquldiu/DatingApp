import { inject } from '@angular/core';
import {
  HttpInterceptorFn
} from '@angular/common/http';
import { BusyService } from '../_services/busy.service';
import { delay, finalize, identity } from 'rxjs';
import { environment } from 'src/environments/environment';


export const loadingInterceptor: HttpInterceptorFn = (req, next) =>{

    const busyService = inject(BusyService);
    busyService.busy();


  return next(req).pipe(
    (environment.production? identity : delay(1000)),
    finalize(() => {
      busyService.idle()
    })
  )
  
}
