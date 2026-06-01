import "server-only";

import type { FileStorageService } from "@/core/domain/services/file-storage-service";

export class DataUrlFileStorageService implements FileStorageService {
  async upload(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  }

  async delete(url: string): Promise<void> {
    void url;
    return;
  }
}
