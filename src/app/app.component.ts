import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
// Need jQuery for events only
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app';
  @ViewChild('canvas') private _canvas: ElementRef;
  private _element: any = undefined;
  private _windowWidth = 256;
  private _windowCenter = 128;

  constructor(public _elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    const imageId = 'https://i.imgur.com/u8VVJSO.jpg';
    this._element = this._elementRef.nativeElement.parentNode;
    // Enable the element with Cornerstone
    cornerstone.enable(this._element, this._canvas.nativeElement);
    // Load the image and enable tools
    cornerstone.loadImage(imageId).then((image: Object, athis: Object) => {
      // by default, it will display still to fit to window
      cornerstone.displayImage(this._element, image);
    });
  }

  /**
   * Method to do window leveling.
   */
  onClick(): void {
    this._windowWidth += 10;
    this._windowCenter += 10;
    if (this._element !== undefined) {
      if (cornerstone.getViewport(this._element) !== undefined) {
        let vwport: any = cornerstone.getViewport(this._element);
        vwport.voi.windowWidth = this._windowWidth;
        vwport.voi.windowCenter = this._windowWidth;
        cornerstone.setViewport(this._element, vwport);
      }
    }
  }
}
