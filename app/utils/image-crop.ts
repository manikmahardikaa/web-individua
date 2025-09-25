export function cropCenterAndResizeLandscape(
  image: File,
  targetW = 400,
  targetH = 225
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Context error"));
      // Crop center dengan rasio 16:9
      const srcAspect = img.width / img.height;
      const targetAspect = targetW / targetH;

      let sx = 0,
        sy = 0,
        sw = img.width,
        sh = img.height;
      if (srcAspect > targetAspect) {
        // Gambar lebih lebar dari target, crop sisi kiri-kanan
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        // Gambar lebih tinggi, crop atas-bawah
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Blob error"));
        resolve(new File([blob], image.name, { type: image.type }));
      }, image.type);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(image);
  });
}
