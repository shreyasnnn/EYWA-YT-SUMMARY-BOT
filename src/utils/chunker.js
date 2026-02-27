function chunkTranscript(transcript, chunkSize = 1000) {
  const chunks = [];
  let currentChunk = "";
  let currentTimestamp = null;

  for (const entry of transcript) {
    const line = `[${Math.floor(entry.start)}s] ${entry.text} `;

    if (!currentTimestamp) {
      currentTimestamp = entry.start;
    }

    if (currentChunk.length + line.length > chunkSize) {
      chunks.push({
        content: currentChunk,
        start: currentTimestamp
      });
      currentChunk = "";
      currentTimestamp = entry.start;
    }

    currentChunk += line;
  }

  if (currentChunk) {
    chunks.push({
      content: currentChunk,
      start: currentTimestamp
    });
  }

  return chunks;
}

module.exports = { chunkTranscript };