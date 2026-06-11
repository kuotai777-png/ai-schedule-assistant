import { messagingApi } from "@line/bot-sdk";
import { parseSchedule } from "../utils/parser.js";

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

function getScheduleText(userText) {
  return userText
    .replace("新增行程：", "")
    .replace("新增行程:", "")
    .trim();
}

function handleText(userText) {
  if (
    userText.startsWith("新增行程：") ||
    userText.startsWith("新增行程:")
  ) {
    const scheduleText = getScheduleText(userText);
    const result = parseSchedule(scheduleText);

    return (
      `新增成功 📅\n\n` +
      `日期：${result.date}\n` +
      `時間：${result.time}\n` +
      `事件：${result.title}`
    );
  }

  if (userText === "說明") {
    return (
      `AI 行程助理使用方式：\n\n` +
      `新增行程:明天下午3點開會\n` +
      `新增行程:今天晚上8點運動\n` +
      `新增行程:後天早上9點看牙醫`
    );
  }

  return (
    `我目前可以處理：\n\n` +
    `新增行程:明天下午3點開會\n\n` +
    `你也可以輸入「說明」。`
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("AI Schedule Assistant is running.");
  }

  try {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const replyText = handleText(event.message.text);

        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: replyText
            }
          ]
        });
      }
    }

    return res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "error" });
  }
}
