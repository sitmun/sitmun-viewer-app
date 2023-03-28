import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthenticationInterceptor } from '@auth/services/authentication.interceptor';
import { AuthenticationService } from '@auth/services/authentication.service';
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true,
      deps: [AuthenticationService, Router]
    }
  ]
})
export class AuthenticationModule {}
