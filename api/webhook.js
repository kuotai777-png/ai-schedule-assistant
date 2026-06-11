import { messagingApi } from "@line/bot-sdk";
import { parseSchedule } from "../utils/parser.js";
import { saveSchedule } from "../utils/googleSheet.js";
const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

function cleanScheduleText(userText) {
  return userText
    .replace("新增行程：", "")
    .replace("新增行程:", "")
    .trim();
}

function looksLikeSchedule(userText) {
  const keywords = [
    "今天",
    "明天",
    "後天",
    "上午",
    "早上",
    "下午",
    "晚上",
    "點"
  ];

  return keywords.some((word) => userText.includes(word));
}

function handleText(userText) {
  if (userText === "說明") {
    return (
      `AI 行程助理使用方式：\n\n` +
      `你可以直接輸入：\n` +
      `明天下午3點開會\n` +
      `今天晚上8點運動\n` +
      `後天早上9點看牙醫\n\n` +
      `也可以輸入：\n` +
      `新增行程:明天下午3點開會`
    );
  }

  if (
    userText.startsWith("新增行程：") ||
    userText.startsWith("新增行程:") ||
    looksLikeSchedule(userText)
  ) {
    const scheduleText = cleanScheduleText(userText);
    const result = parseSchedule(scheduleText);

await saveSchedule(result);

return (
  `新增成功 📅\n\n` +
  `日期：${result.date}\n` +
  `時間：${result.time}\n` +
  `事件：${result.title}`
);
  }

  return (
    `我目前可以處理行程輸入，例如：\n\n` +
    `明天下午3點開會\n` +
    `今天晚上8點運動\n\n` +
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
