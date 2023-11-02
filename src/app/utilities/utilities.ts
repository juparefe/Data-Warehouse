import { Buffer } from 'buffer';

export function decodeAndSetImage(base64Image: string): Blob {
  const binaryData = Buffer.from(base64Image, 'base64');
  const blob =  new Blob([binaryData], { type: 'image/jpeg' });
  return blob;
}
