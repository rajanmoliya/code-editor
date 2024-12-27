export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
    });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
