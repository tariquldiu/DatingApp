import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component'; 

platformBrowserDynamic().bootstrapComponent(AppComponent)
  .catch(err => console.error(err));