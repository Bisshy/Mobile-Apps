import { Injectable } from '@angular/core';

import { Capacitor } from '@capacitor/core';

import {
  ActionSheet,
  ActionSheetButtonStyle
} from '@capacitor/action-sheet';

import {
  Camera,
  MediaTypeSelection
} from '@capacitor/camera';


@Injectable({
  providedIn: 'root'
})


export class ProfilePhotoService {


  async selectNativePhoto(): Promise<string | undefined> {

    try {

      const result =
        await ActionSheet.showActions({

          title: 'Profile Photo',

          options: [

            {
              title: 'Take Photo'
            },

            {
              title: 'Choose from Gallery'
            },

            {
              title: 'Cancel',

              style:
                ActionSheetButtonStyle.Cancel
            }

          ]

        });


      if (result.index === 0) {

        return await this.takePhoto();
      }


      if (result.index === 1) {

        return await this.chooseFromGallery();
      }


      return undefined;

    } catch (error) {

      console.error(
        'Native profile photo selection failed:',
        error
      );

      return undefined;
    }

  }


  async takePhoto(): Promise<string | undefined> {

    try {

      const result =
        await Camera.takePhoto({

          quality: 90

        });


      return result.webPath;

    } catch (error) {

      console.error(
        'Taking profile photo failed:',
        error
      );

      return undefined;
    }

  }


  async chooseFromGallery(): Promise<string | undefined> {

    try {

      const { results } =
        await Camera.chooseFromGallery({

          mediaType:
            MediaTypeSelection.Photo

        });


      if (results.length === 0) {

        return undefined;
      }


      return results[0].webPath;

    } catch (error) {

      console.error(
        'Choosing profile photo failed:',
        error
      );

      return undefined;
    }

  }


  isNative(): boolean {

    return Capacitor.isNativePlatform();
  }

}