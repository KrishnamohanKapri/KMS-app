import { Component } from '@angular/core';
import { LoaderService } from './loader.service';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  standalone: true,
  imports: [AsyncPipe, NgIf]
})
export class LoaderComponent {
  loading$;

  constructor(private loaderService: LoaderService) {
    this.loading$ = this.loaderService.loading$;
  }
}