import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class ProfileStorageService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async uploadProfilePhoto(
    uid: string,
    imageUrl: string
  ): Promise<string> {

    console.log(
      'ProfileStorageService started.'
    );

    console.log(
      'Image URL:',
      imageUrl
    );

    const response =
      await fetch(imageUrl);

    console.log(
      'Image fetch response:',
      response
    );

    if (!response.ok) {
      throw new Error(
        'Unable to read profile image.'
      );
    }

    const blob =
      await response.blob();

    console.log(
      'Image blob:',
      blob
    );

    console.log(
      'Blob type:',
      blob.type
    );

    console.log(
      'Blob size:',
      blob.size
    );

    const filePath =
      `${uid}/avatar.jpg`;

    console.log(
      'Supabase file path:',
      filePath
    );

    const {
      data,
      error
    } =
      await this.supabaseService.client
        .storage
        .from('avatars')
        .upload(
          filePath,
          blob,
          {
            contentType:
              blob.type || 'image/jpeg',

            upsert: true
          }
        );

    console.log(
      'Supabase upload data:',
      data
    );

    console.log(
      'Supabase upload error:',
      error
    );

    if (error) {
      throw error;
    }

    const {
      data: publicUrlData
    } =
      this.supabaseService.client
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

    console.log(
      'Supabase public URL:',
      publicUrlData.publicUrl
    );

    return publicUrlData.publicUrl;
  }

}

