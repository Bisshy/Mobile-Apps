import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

import { IonButton } from '@ionic/angular';


@Component({
  selector: 'app-web-camera',
  templateUrl: './web-camera.component.html',
  styleUrls: ['./web-camera.component.scss'],
  imports: [
    IonButton
  ]
})


export class WebCameraComponent
  implements AfterViewInit, OnDestroy {

  @Output()
  photoCaptured = new EventEmitter<string>();

  @Output()
  cameraClosed = new EventEmitter<void>();


  @ViewChild('cameraVideo')
  cameraVideo!: ElementRef<HTMLVideoElement>;


  cameraStream: MediaStream | null = null;


  ngAfterViewInit(): void {
    this.openCamera();
  }


  async openCamera(): Promise<void> {

    try {

      this.cameraStream =
        await navigator.mediaDevices.getUserMedia({
          video: true
        });


      const video =
        this.cameraVideo.nativeElement;


      video.srcObject =
        this.cameraStream;


      await video.play();

    } catch (error) {

      console.error(
        'Unable to access camera:',
        error
      );

      this.cameraClosed.emit();
    }
  }


  capturePhoto(): void {

    if (!this.cameraVideo) {
      return;
    }


    const video =
      this.cameraVideo.nativeElement;


    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {

      console.error(
        'Camera is not ready yet.'
      );

      return;
    }


    const canvas =
      document.createElement('canvas');


    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;


    const context =
      canvas.getContext('2d');


    if (!context) {
      return;
    }


    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    const photo =
      canvas.toDataURL('image/jpeg');


    this.photoCaptured.emit(photo);

    this.stopCamera();
  }


  closeCamera(): void {

    this.stopCamera();

    this.cameraClosed.emit();
  }


  private stopCamera(): void {

    if (!this.cameraStream) {
      return;
    }


    this.cameraStream
      .getTracks()
      .forEach(track => track.stop());


    this.cameraStream = null;
  }


  ngOnDestroy(): void {
    this.stopCamera();
  }

}