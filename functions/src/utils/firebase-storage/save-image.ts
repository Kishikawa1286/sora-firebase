import admin from "../admin";

const messageImagesDirectoryPath = "v1/images";

export const messageImagePath = (fileName: string): string =>
  `${messageImagesDirectoryPath}/${fileName}`;

export const downloadUrl = (path: string): string =>
  `https://firebasestorage.googleapis.com/v0/b/${
    admin.storage().bucket().name
  }/o/${encodeURIComponent(path)}?alt=media`;

export const saveImage = async ({
  imagePath,
  buffer,
  contentType
}: {
  imagePath: string;
  buffer: Buffer;
  contentType: string;
}): Promise<void> => {
  try {
    await admin.storage().bucket().file(imagePath).save(buffer, {
      contentType: contentType
    });
  } catch (error) {
    throw new Error(`Failed to save the image. Error: ${error}`);
  }
};
