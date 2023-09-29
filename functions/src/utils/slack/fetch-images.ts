import axios from "axios";
import { resizeImage } from "../image/resize-image";
import { SlackFile } from "./types/message-events";

export const fetchImages = async ({
  accessToken,
  slackFiles
}: {
  accessToken: string;
  slackFiles: SlackFile[];
}): Promise<Buffer[]> => {
  const buffers = await Promise.all(
    slackFiles.map(async (slackFile) => {
      if (!slackFile.mimetype.startsWith("image/")) {
        return null;
      }

      const response = await axios.get<Buffer>(slackFile.url_private_download, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return resizeImage(response.data, {
        width: 400,
        height: 400
      });
    })
  );

  return buffers.filter((buffer) => buffer !== null) as Buffer[];
};
