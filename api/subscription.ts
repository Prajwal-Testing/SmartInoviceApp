export default async function handler(
  req: any,
  res: any
) {
  try {
    const response = await fetch("https://pastebin.com/raw/3VRBKyiq");
    const data = await response.json();

    return res.status(200).json({
      sub: Boolean(data.sub),
      expiry_date: data.expiry_date || "",
    });

  } catch (err) {
    return res.status(500).json({
      sub: false,
      expiry_date: new Date().toISOString(),
    });
  }
}
