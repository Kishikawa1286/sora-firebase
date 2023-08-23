import { Client } from '@line/bot-sdk';
import { CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET } from '../../../utils/env';
import { functions128MB } from '../../../utils/functions';

const lineClient = new Client({
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
});

/**
 * Hello World関数
 */
export const helloWorld = functions128MB.https.onRequest(async (req, res) => {
  const events = req.body.events[0];
  // Hello Wolrdを送信する。
  await lineClient.replyMessage(events.replyToken, {
    type: 'text',
    text: 'Hello World!!!',
  });
  res.status(200).send();
});
