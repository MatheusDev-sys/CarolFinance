import imageCompression from 'browser-image-compression';

export async function compressImage(file: File) {
  const options = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Original size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`Compressed size: ${(compressedFile.size / 1024).toFixed(2)} KB`);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Fallback to original
  }
}
