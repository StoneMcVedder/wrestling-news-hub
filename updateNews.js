import Parser from "rss-parser";
import fs from "fs";

const parser = new Parser();

// Using very stable feeds
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
        articles.push({
          source: feed.name,
          title: item.title,
          link: item.link,
          date: item.pubDate,
          summary: item.contentSnippet ? item.contentSnippet.slice(0, 150) + "..." : ""
        });
      });
      console.log(`✅ ${feed.name} loaded.`);
    } catch (error) {
      console.warn(`⚠️ Skipping ${feed.name} due to error: ${error.message}`);
    }
  }

  if (articles.length > 0) {
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    fs.writeFileSync("./public/updates.json", JSON.stringify(articles.slice(0, 15), null, 2));
    console.log("\n🚀 DONE! Refresh your browser to see the news.");
  } else {
    console.error("\n❌ No news could be fetched from any source.");
  }
}

updateNews();