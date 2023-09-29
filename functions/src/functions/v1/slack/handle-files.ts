import {
  downloadUrl,
  saveImage
} from "../../../utils/firebase-storage/save-image";
import { randomString } from "../../../utils/random-string";
import { fetchImages } from "../../../utils/slack/fetch-images";
import { SlackFile } from "../../../utils/slack/types/message-events";

export const handleSlackFiles = async ({
  files,
  accessToken
}: {
  files: SlackFile[] | undefined;
  accessToken: string;
}): Promise<{ imageUrls: string[]; nonImageFiles: SlackFile[] }> => {
  if (!files) {
    return {
      imageUrls: [],
      nonImageFiles: []
    };
  }

  const imageBuffers = await fetchImages({
    accessToken,
    slackFiles: files
  });
  // Unique enough because the number of patterns of the file name is 60^64
  const imageFileDataArray = imageBuffers.map((buffer) => {
    return {
      buffer,
      imagePath: `${randomString(64)}.jpeg`,
      contentType: "image/jpeg"
    };
  });
  await Promise.all(imageFileDataArray.map(saveImage));
  const imageUrls = imageFileDataArray.map((fileData) =>
    downloadUrl(fileData.imagePath)
  );

  return {
    imageUrls,
    nonImageFiles: files.filter((file) => !file.mimetype.startsWith("image/"))
  };
};
