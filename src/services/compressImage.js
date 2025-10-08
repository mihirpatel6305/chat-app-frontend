import Compressor from "compressorjs";

export const compressImage = (
  file,
  quality = 0.8,
  maxWidth = 1024,
  maxHeight = 1024
) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight,
      success(result) {
        resolve(result);
      },
      error(err) {
        reject(err);
      },
    });
  });
};
