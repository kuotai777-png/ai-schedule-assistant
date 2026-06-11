export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("AI Schedule Assistant is running.");
  }

  console.log("LINE webhook body:", JSON.stringify(req.body));

  return res.status(200).json({
    status: "OK"
  });
}
