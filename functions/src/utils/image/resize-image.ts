import * as sharp from "sharp";

export const resizeImage = async (
  buffer: Buffer,
  {
    width,
    height
  }: {
    width: number;
    height: number;
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
      .jpeg({ quality: 70 })
      .toBuffer();

    return resizedBuffer;
  } catch (error) {
    throw new Error(`Failed to resize the image. Error: ${error}`);
  }
};
