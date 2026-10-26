const { processEmailWithAI } = require('./utils/aiTaskExtractor');

(async () => {
  console.log("🚀 Testing AI Extractor directly...");
  
  const result = await processEmailWithAI(
    "Direct Test Task #999",
    "We need to build a mobile app. 1. Design UI 2. Code backend. Also contact John from Apple (john@apple.com). Deadline is 2026-12-31.",
    "test@gmail.com"
  );
  
  console.log("✅ Final Result:", result);
})();