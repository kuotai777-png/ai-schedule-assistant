import { messagingApi } from "@line/bot-sdk";

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

function handleText(userText) {
  if (userText.startsWith("新增行程：") || userText.startsWith("新增行程:")) {
    const scheduleText = userText
      .replace("新增行程：", "")
      .replace("新增行程:", "")
      .trim();

    return `收到行程 👍\n\n你輸入的是：\n${scheduleText}\n\n下一步我會幫你解析日期與時間。`;
  }

  if (userText === "說明") {
    return `AI 行程助理使用方式：\n\n1. 新增行程：明天下午3點開會\n2. 查詢行程\n3. 今日行程`;
  }

  return `我目前可以處理：\n\n新增行程：明天下午3點開會\n\n你也可以輸入「說明」。`;
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
        const replyText = handleText(userText);

        await client.replyMessage({
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
