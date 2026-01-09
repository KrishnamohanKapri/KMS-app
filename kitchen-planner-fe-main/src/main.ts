import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';  // your routes file
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from './environments/environment';
import { BASE_PATH } from './app/api/api-kms-planner-masterdata';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptor/token.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(MatSnackBarModule), // ✅ Global import for Angular Material modules
    {
      provide:BASE_PATH, useValue: environment.apiUrl

    },
    provideHttpClient(withInterceptors([authInterceptor])),

  ]
});


