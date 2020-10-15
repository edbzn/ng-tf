import { Injectable } from '@angular/core';
import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs-backend-webgl';

@Injectable({
  providedIn: 'root',
})
export class Recognizer {
  private _stream: MediaStream;

  get stream(): MediaStream {
    return this._stream;
  }

  async initialize(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    await this._setupCamera(video);
    const ctx = this._setupCanvas(canvas, video);
    const model = await blazeface.load();

    const returnTensors = false;
    const flipHorizontal = true;
    const annotateBoxes = true;

    const runDetection = async () => {
      const predictions = await model.estimateFaces(
        video,
        returnTensors,
        flipHorizontal,
        annotateBoxes
      );

      /**
       * Render predictions into canvas.
       */
      if (predictions.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < predictions.length; i++) {
          if (returnTensors) {
            predictions[i].topLeft = (predictions[i]
              .topLeft as any).arraySync();
            predictions[i].bottomRight = (predictions[i]
              .bottomRight as any).arraySync();
            if (annotateBoxes) {
              predictions[i].landmarks = (predictions[i]
                .landmarks as any).arraySync();
            }
          }

          const start = predictions[i].topLeft;
          const end = predictions[i].bottomRight;
          const size = [end[0] - start[0], end[1] - start[1]];
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.fillRect(start[0], start[1], size[0], size[1]);

          if (annotateBoxes) {
            const landmarks = predictions[i].landmarks;

            ctx.fillStyle = 'blue';
            for (let j = 0; j < (landmarks as any).length; j++) {
              const x = landmarks[j][0];
              const y = landmarks[j][1];
              ctx.fillRect(x, y, 5, 5);
            }
          }
        }
      }

      requestAnimationFrame(runDetection);
    };

    runDetection();
  }

  /**
   * Setup canvas.
   */
  private _setupCanvas(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, video.width, video.height);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    return ctx;
  }

  /**
   * Setup camera stream.
   */
  private _setupCamera(video: HTMLVideoElement): Promise<HTMLVideoElement> {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
      })
      .then((stream) => (this._stream = stream));

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }
}
