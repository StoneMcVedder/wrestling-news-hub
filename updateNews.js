import Parser from "rss-parser";
import fs from "fs";

const parser = new Parser();

// Using the most stable wrestling feeds
const feeds = [
  { name: "WWE", url: "https://www.wwe.com/feeds/rss/news" },
  { name: "Wrestling Inc", url: "https://www.wrestlinginc.com/rss/" }
];

async function updateNews() {
  let articles = [];

  for (const feed of feeds) {
    try {
      console.log(`Attempting to fetch ${feed.name}...`);
      const data = await parser.parseURL(feed.url);
      
      data.items.slice(0, 5).forEach(item => {
        // Look for an image in the content
        let imageUrl = "https://via.placeholder.com/400x225?text=Wrestling+News";
        const imgMatch = item.contentSnippet?.match(/src="([^"]+)"/) || item.content?.match(/src="([^"]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];

        articles.push({
          source: feed.name,
          title: item.title,
          link: item.link,
          date: item.pubDate,
          image: imageUrl,
          summary: item.contentSnippet?.replace(/<[^>]*>/g, '').slice(0, 100) + "..."
        });
      });
      console.log(`✅ ${feed.name} loaded successfully.`);
    } catch (error) {
      console.warn(`⚠️ Skipping ${feed.name} due to error: ${error.message}`);
    }
  }

  if (articles.length > 0) {
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    // Ensure the public directory exists for GitHub Actions
    if (!fs.existsSync('./public')) fs.mkdirSync('./public');
    fs.writeFileSync("./public/updates.json", JSON.stringify(articles.slice(0, 15), null, 2));
    console.log("\n🚀 DONE! News file has been updated.");
  } else {
    console.error("\n❌ Critical Error: No news could be fetched from any source.");
    process.exit(1); // Tell GitHub the run failed if NO news was found
  }
}

updateNews();
