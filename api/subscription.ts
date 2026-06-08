export default async function handler(req, res) {
  try {
    const response = await fetch("https://pastebin.com/raw/3VRBKyiq");

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch" });
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json({
      sub: !!data.sub,
      expiry_date: data.expiry_date || "",
    });

  } catch (err) {
    return res.status(500).json({
      sub: false,
      expiry_date: new Date().toISOString(),
    });
  }
}
