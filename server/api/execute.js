import { auth } from "../middlewares/auth.middleware";
import { exec } from "child_process";
import fs from "fs/promises";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, language } = req.body;

  const filename = `temp_${Date.now()}`;
  const fileExtensions = { javascript: "js", python: "py", cpp: "cpp" };
  const commands = {
    javascript: `node ${filename}.js`,
    python: `python ${filename}.py`,
    cpp: `g++ ${filename}.cpp -o ${filename}.exe && ${filename}.exe`,
  };

  try {
    await fs.writeFile(`${filename}.${fileExtensions[language]}`, code);
    exec(commands[language], async (error, stdout, stderr) => {
      await fs.unlink(`${filename}.${fileExtensions[language]}`);
      if (language === "cpp") {
        await fs.unlink(`${filename}.exe`).catch(() => {});
      }

      if (error) return res.status(500).json({ error: stderr });
      res.json({ output: stdout });
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
