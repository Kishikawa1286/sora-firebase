import * as sharp from "sharp";

export const resizeImage = async (
  buffer: Buffer,
  {
    width,
    height,
    format
  }: {
    width: number;
    height: number;
    format: "webp" | "jpeg" | "png";
  }
): Promise<Buffer> => {
  try {
    const resizedBuffer = await sharp(buffer)
      .resize({
        width: width,
        height: height,
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFormat(format, { quality: 70 })
      .toBuffer();

    return resizedBuffer;
  } catch (error) {
    throw new Error(`Failed to resize the image. Error: ${error}`);
  }
};
