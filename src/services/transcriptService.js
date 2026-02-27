const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

async function fetchTranscript(videoId) {
  return new Promise((resolve) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const command = `.\\yt-dlp.exe --skip-download --write-auto-subs --sub-lang en --sub-format vtt ${videoUrl}`;

    exec(command, (error) => {
      if (error) {
        console.error("yt-dlp error:", error.message);
        return resolve(null);
      }

      const files = fs.readdirSync(process.cwd());

      const vttFile = files.find(
        (file) =>
          file.endsWith(".en.vtt") &&
          file.includes(`[${videoId}]`)
      );

      if (!vttFile) {
        console.log("VTT file not found");
        return resolve(null);
      }

      const filePath = path.join(process.cwd(), vttFile);
      const content = fs.readFileSync(filePath, "utf-8");

      // cleanup
      fs.unlinkSync(filePath);

      const transcript = parseVTT(content);
      resolve(transcript);
    });
  });
}

function parseVTT(vtt) {
  const lines = vtt.split("\n");
  const transcript = [];

  let currentTime = 0;

  for (let line of lines) {
    line = line.trim();

    const match = line.match(/(\d+:\d+:\d+\.\d+)/);

    if (match) {
      const [h, m, s] = match[1].split(":");
      currentTime =
        parseInt(h) * 3600 +
        parseInt(m) * 60 +
        parseFloat(s);
      continue;
    }

    if (line && !line.startsWith("WEBVTT")) {
      transcript.push({
        text: line,
        start: currentTime,
      });
    }
  }

  return transcript;
}

module.exports = { fetchTranscript };