import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Recognizer } from './recognizer.service';

@Component({
  selector: 'app-root',
  template: `
    <div id="main">
      <video
        #video
        autoplay
        [width]="w"
        [height]="h"
        [srcObject]="stream"
      ></video>
      <canvas #canvas [width]="w" [height]="h"></canvas>
    </div>
  `,
  styles: [
    `
      #main {
        position: relative;
      }

      canvas {
        position: absolute;
        top: 0;
        left: 0;
      }

      video {
        width: auto;
        height: auto;
      }
    `,
  ],
})
export class AppComponent implements AfterViewInit {
  w = 1200;
  h = 600;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

  get stream(): MediaStream {
    return this._recognizer.stream;
  }

  constructor(private _recognizer: Recognizer) {}

  ngAfterViewInit(): void {
    this._recognizer.initialize(
      this.canvas.nativeElement,
      this.video.nativeElement
    );
  }
}
