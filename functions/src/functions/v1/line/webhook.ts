/* eslint-disable operator-linebreak */
/* eslint-disable indent */
import { WebhookEvent } from "@line/bot-sdk/lib/types";
import { firestore } from "../../../utils/admin";
import { functions128MB } from "../../../utils/functions";
import { lineClient } from "../../../utils/line/line-client";
import { generateNegativeChatReply } from "../../../utils/openai/generate-negative-reply";
import { generatePositiveChatReply } from "../../../utils/openai/generate-positive-reply";
import { summarize } from "../../../utils/openai/summarize";

export const lineWebhook = functions128MB.https.onRequest(async (req, res) => {
  await Promise.all(
    req.body.events.map((event: WebhookEvent) => replyWebhookEvent(event))
  );

  res.status(200).send();
});
const replyWebhookEvent = async (event: WebhookEvent) => {
  const isRoomOrGroup =
    event.source.type === "room" || event.source.type === "group";

  const roomId =
    event.source.type === "room"
      ? event.source.roomId
      : event.source.type === "group"
      ? event.source.groupId
      : null ?? null;
  if (roomId === null) throw new Error("invalid room type");

  if (
    event.type !== "message" ||
    event.message.type !== "text" ||
    !isRoomOrGroup
  ) {
    // 処理しない
    return;
  }

  const text = event.message.text;

  // rooms > { id: event.source.roomId, target: 対象者の lineUserId, user: sora 利用者の lineUserId };

  if (event.source.userId !== undefined) {
    const memberProfile = await lineClient.getGroupMemberProfile(
      roomId,
      event.source.userId
    );
    lineClient.replyMessage(event.replyToken, {
      type: "text",
      text: JSON.stringify(memberProfile)
    });
  }

  // sora-app のユーザーでない側のユーザーに「はじめまして」と初期登録のために言わせる
  if (text === "はじめまして") {
    await firestore.collection("rooms").doc(roomId).set({
      roomId: roomId,
      target: event.source.userId
    });

    return;
  }

  // これ以降はデッドコード
  // sora-app ユーザーの登録
  if (text === "よろしくお願いします") {
    await firestore.collection("rooms").doc(roomId).update({
      user: event.source.userId
    });
    return;
  }

  // rooms コレクションの roomId のドキュメントを取得
  // そのドキュメントの target フィールドが event.source.userId と一致するかどうか
  // する場合、要約対象者の発言のため、要約及び、保存を行う。どこに保存するかというと、room ドキュメントの user フィールドの値が lineUserId と一致するようなドキュメントを持っている user
  // しない場合、要約対象者ではないため、無視
  const room = await firestore.collection("rooms").doc(roomId).get();
  const roomData = room.data() as {
    roomId: string;
    target?: string;
    user?: string;
  };
  if (
    !room.exists ||
    roomData.target === undefined ||
    roomData.user === undefined
  ) {
    // 登録されていない部屋
    return;
  }

  // 要約対象者
  if (event.source.userId === roomData.target) {
    const summary = await summarize(text);
    const positiveReply = await generatePositiveChatReply(text);
    const negativeReply = await generateNegativeChatReply(text);

    if (summary === null || positiveReply === null || negativeReply === null) {
      throw new Error("Failed to summarize");
    }

    // 返信タスクとして保存
    return;
  }

  // sora-app 利用者の発言のため skip
  if (event.source.userId === roomData.user) {
    // 本当は書かなくていいがやってる事がわかりやすいため
  }
};
