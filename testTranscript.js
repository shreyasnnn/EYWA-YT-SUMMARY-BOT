const { getSubtitles } = require("youtube-captions-scraper");

(async () => {
  try {
    const data = await getSubtitles({
      videoID: "aircAruvnKk",
      lang: "en",
    });

    console.log("Length:", data.length);
    console.log(data.slice(0, 3));
  } catch (err) {
    console.error("ERROR:", err);
  }
})();