import { Component } from '@angular/core';
declare var objectFitVideos: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  ngOnInit() {
    objectFitVideos();
  }
}
