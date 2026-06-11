export function parseSchedule(text) {
  let date = "未判斷";
  let time = "未判斷";
  let title = text;

  if (text.includes("今天")) {
    date = "今天";
    title = title.replace("今天", "");
  }

  if (text.includes("明天")) {
    date = "明天";
    title = title.replace("明天", "");
  }

  if (text.includes("後天")) {
    date = "後天";
    title = title.replace("後天", "");
  }

  const timeMatch = text.match(/(上午|早上|下午|晚上)?(\d{1,2})點/);

  if (timeMatch) {
    const period = timeMatch[1] || "";
    let hour = Number(timeMatch[2]);

    if ((period === "下午" || period === "晚上") && hour < 12) {
      hour += 12;
    }

    time = `${String(hour).padStart(2, "0")}:00`;

    title = title.replace(timeMatch[0], "");
  }

  title = title
    .replace("新增行程:", "")
    .replace("新增行程：", "")
    .trim();

  if (!title) {
    title = "未命名行程";
  }

  return {
    date,
    time,
    title
  };
}
