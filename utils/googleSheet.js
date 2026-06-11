export async function saveSchedule(data) {

  const response = await fetch(
    process.env.GOOGLE_SCRIPT_URL,
    {
      method: "POST",
      body: JSON.stringify({
        date: data.date,
        time: data.time,
        title: data.title
      })
    }
  );

  return await response.json();
}
