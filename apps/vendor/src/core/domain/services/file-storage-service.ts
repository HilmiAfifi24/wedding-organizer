export interface FileStorageService {
  upload(file: File): Promise<string>;
  delete(url: string): Promise<void>;
}
