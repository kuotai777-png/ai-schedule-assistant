import { messagingApi } from "@line/bot-sdk";
import OpenAI from "openai";

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function parseSchedule(text) {
  const today = new Date().toLocaleDateString("zh-TW", {
    timeZone: "Asia/Taipei"
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "你是行程解析助手。請把使用者輸入的中文行程，轉成 JSON。只回傳 JSON，不要解釋。格式：{\"date\":\"YYYY-MM-DD或不確定\",\"time\":\"HH:mm或不確定\",\"title\":\"事件內容\",\"note\":\"補充\"}"
      },
      {
        role: "user",
        content: `今天日期是 ${today}。請解析這個行程：${text}`
      }
    ],
    temperature: 0.2
  });

  return JSON.parse(response.choices[0].message.content);
}

function getScheduleText(userText) {
  return userText
    .replace("新增行程：", "")
    .replace("新增行程:", "")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("AI Schedule Assistant is running.");
  }

  try {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;

        let replyText = "";

        if (
          userText.startsWith("新增行程：") ||
          userText.startsWith("新增行程:")
        ) {
          const scheduleText = getScheduleText(userText);
          const result = await parseSchedule(scheduleText);

          replyText =
            `已解析行程 👍\n\n` +
            `📅 日期：${result.date}\n` +
            `⏰ 時間：${result.time}\n` +
            `📌 事件：${result.title}\n` +
            `📝 備註：${result.note || "無"}`;
        } else if (userText === "說明") {
          replyText =
            "AI 行程助理使用方式：\n\n" +
            "新增行程：明天下午3點開會\n" +
            "新增行程：下週五早上9點看牙醫";
        } else {
          replyText =
            "我目前可以處理：\n\n" +
            "新增行程：明天下午3點開會\n\n" +
            "你也可以輸入「說明」。";
        }

        await lineClient.replyMessage({
          replyToken: event.replyToken,
          messages: [{ type: "text", text: replyText }]
        });
      }
    }

    return res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "error" });
  }
}
