import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";

// Language configurations with extensions, commands, timeouts, and cleanup settings
const LANGUAGE_CONFIGS = {
  javascript: {
    extension: "js",
    command: "node {filePath}",
    timeout: 5000,
  },
  python: {
    extension: "py",
    command: "python3 {filePath}",
    timeout: 10000,
  },
  cpp: {
    extension: "cpp",
    command: "g++ {filePath} -o {fileBase}.out && {fileBase}.out",
    cleanupFiles: ["{fileBase}.out"],
    timeout: 8000,
  },
  rust: {
    extension: "rs",
    command: "rustc {filePath} -o {fileBase} && {fileBase}",
    cleanupFiles: ["{fileBase}"],
    timeout: 10000,
  },
  java: {
    extension: "java",
    command: "javac {filePath} && java -cp {tempDir} {className}",
    cleanupFiles: ["{className}.class"],
    timeout: 10000,
  },
  kotlin: {
    extension: "kt",
    command:
      "kotlinc {filePath} -include-runtime -d {fileBase}.jar && java -jar {fileBase}.jar",
    cleanupFiles: ["{fileBase}.jar"],
    timeout: 8000,
  },
  go: {
    extension: "go",
    command: "go run {filePath}",
    timeout: 8000,
  },
  haskell: {
    extension: "hs",
    command: "ghc {filePath} -o {fileBase} && {fileBase}",
    cleanupFiles: ["{fileBase}"],
    timeout: 10000,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, language } = req.body;

  // Validate language support
  const config = LANGUAGE_CONFIGS[language];
  if (!config) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  // Create unique file identifiers
  const tempDir = "/usr/src/server/temp";
  const uniqueId = `temp_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`;
  const filePath = path.join(tempDir, `${uniqueId}.${config.extension}`);
  const fileBase = path.join(tempDir, uniqueId);

  try {
    // Handle Java class name extraction
    let className = uniqueId; // Default class name
    if (language === "java") {
      const match = code.match(/public\s+class\s+(\w+)/);
      if (match && match[1]) {
        className = match[1];
      } else {
        throw new Error("No public class name found in Java code.");
      }
    }

    // Write code to the temp file
    await fs.writeFile(filePath, code, { mode: 0o600 });

    // Construct the execution command
    const executeCommand = config.command
      .replace(/{filePath}/g, filePath)
      .replace(/{fileBase}/g, fileBase)
      .replace(/{tempDir}/g, tempDir)
      .replace(/{className}/g, className);

    console.log(`Executing command: ${executeCommand}`);

    // Execute the command
    exec(
      executeCommand,
      { timeout: config.timeout, maxBuffer: 1024 * 1024, cwd: tempDir },
      async (error, stdout, stderr) => {
        // Cleanup files
        await cleanUpFiles(filePath, config.cleanupFiles, {
          fileBase,
          className,
        });

        if (error) {
          // Handle execution errors
          const errorMessage =
            error.code === "ETIMEDOUT"
              ? "Code execution timed out"
              : stderr || error.message;
          return res.status(500).json({ error: errorMessage });
        }

        // Send execution output
        res.json({ output: stdout.trim(), language });
      }
    );
  } catch (error) {
    console.error("Error during execution setup:", error);
    res.status(500).json({
      error: "Failed to execute the code",
      details: error.message,
    });
  }
}

// Function to clean up temporary files
async function cleanUpFiles(mainFile, cleanupFiles = [], placeholders = {}) {
  try {
    // Remove the main file
    await fs.unlink(mainFile);

    // Remove additional cleanup files
    for (const cleanupFile of cleanupFiles) {
      const resolvedPath = cleanupFile
        .replace(/{fileBase}/g, placeholders.fileBase)
        .replace(/{className}/g, placeholders.className);
      await fs.unlink(resolvedPath).catch(() => {}); // Ignore errors
    }
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}
