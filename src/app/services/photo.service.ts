import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Camera,
  CameraResultType,
  CameraSource,
  ImageOptions,
} from '@capacitor/camera';
import { environment } from '../../environments/environment';

interface UploadResponse {
  url: string;
  path: string;
  name: string;
  mimeType: string;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private readonly uploadUrl = `${environment.apiUrl}/uploads`;

  constructor(private http: HttpClient) {}

  async captureFromCameraAndUpload(): Promise<string> {
    return this.captureAndUpload(CameraSource.Camera);
  }

  async pickFromGalleryAndUpload(): Promise<string> {
    return this.captureAndUpload(CameraSource.Photos);
  }

  private async captureAndUpload(source: CameraSource): Promise<string> {
    const options: ImageOptions = {
      quality: 85,
      resultType: CameraResultType.Uri,
      source,
      webUseInput: true,
      correctOrientation: true,
    };

    const photo = await Camera.getPhoto(options);

    if (!photo.webPath) {
      throw new Error('PHOTO_WEB_PATH_NOT_AVAILABLE');
    }

    const blob = await this.webPathToBlob(photo.webPath, photo.format);
    const extension = photo.format ?? 'jpg';
    const fileName = `exercise-${Date.now()}.${extension}`;
    const formData = new FormData();
    formData.append('file', blob, fileName);

    const response = await firstValueFrom(
      this.http.post<UploadResponse>(this.uploadUrl, formData)
    );

    return response.url;
  }

  private async webPathToBlob(webPath: string, format?: string): Promise<Blob> {
    const response = await fetch(webPath);
    const original = await response.blob();
    if (original.type) return original;
    return new Blob([original], { type: `image/${format ?? 'jpeg'}` });
  }
}
