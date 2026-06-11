import { messagingApi } from "@line/bot-sdk";

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("AI Schedule Assistant is running.");
  }

  try {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;

        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: `收到 👍\n我目前收到的是：\n${userText}`
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
