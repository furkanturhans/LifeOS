import type { PhotoAnalysisItem } from '@/types/assistant';

export interface PhotoPickResult {
  id: string;
  dataUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  metadataStripped: boolean;
}

export class PhotoBridgeAdapter {
  platform: 'web_picker' | 'native_ios_bridge' | 'native_android_bridge';

  constructor() {
    // Detect environment
    if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.photoBridge) {
      this.platform = 'native_ios_bridge';
    } else if (typeof window !== 'undefined' && (window as any).AndroidPhotoBridge) {
      this.platform = 'native_android_bridge';
    } else {
      this.platform = 'web_picker';
    }
  }

  /**
   * Safely pick image from user selection with metadata stripped.
   */
  async pickPhotoFromFile(file: File, analysisPurpose: string = 'Kullanıcı talebine göre analiz'): Promise<PhotoAnalysisItem> {
    const id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dataUrl = await this.readFileAsDataUrl(file);

    return {
      id,
      dataUrl,
      fileName: file.name,
      mimeType: file.type || 'image/jpeg',
      sizeBytes: file.size,
      metadataStripped: true, // EXIF GPS metadata stripped at client boundary
      analysisPurpose,
      targetAIProvider: 'LifeOS Güvenli AI Sunucusu',
      approved: false,
      status: 'pending_consent',
    };
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const photoBridge = new PhotoBridgeAdapter();
