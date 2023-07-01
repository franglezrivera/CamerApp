import { Injectable } from '@angular/core';
import { Camera, GalleryPhoto } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  constructor() {}

  public photos: UserPhoto[] = [];

  public async addNewToGallery() {
    const captureFiles = await Camera.pickImages({});
    //console.log('captureFiles', captureFiles.photos);
    const savedImageFiles = await this.savePicture(captureFiles.photos);
    console.log(savedImageFiles);

    for (let index = 0; index < savedImageFiles.length; index++) {
      const element = savedImageFiles[index];
      this.photos.unshift({
        filepath: 'soon...',
        webviewPath: element.webviewPath,
      });
    }
  }

  private async savePicture(photos: GalleryPhoto[]) {
    let savedPhotos: any[] = [];
    for (let index = 0; index < photos.length; index++) {
      const photo = photos[index];
      // Convert photo to base64 format, required by Filesystem API to save
      const base64Data = await this.readAsBase64(photo);
      // Write the file to the data directory
      const fileName = Date.now() + '.jpeg';
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
      });
      savedPhotos.push({
        fileName: fileName,
        webviewPath: photo.webPath,
      });
    }

    return savedPhotos;
  }

  private async readAsBase64(photo: GalleryPhoto) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return (await this.convertBlobToBase64(blob)) as string;
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
