import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';

@Component({
  imports: [LoginComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styles: [`:host { display: block; height: 100%; }`],
})
export class App { }
