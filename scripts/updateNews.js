import Parser from "rss-parser";
import fs from "fs";

const parser = new Parser();
const feeds = [
  { name: "WWE", url: "https://www.wwe.com/feeds/rss/news" },
  { name: "WrestlingInc", url: "https://www.wrestlinginc.com/rss/" },
  { name: "AEW", url: "https://www.allelitewrestling.com/blog-feed.xml" },
  { name: "NJPW", url: "https://www.njpw1912.com/feed/" }
];

async function updateNews() {
  let articles = [];
  for (const feed of feeds) {
    try {
      const data = await parser.parseURL(feed.url);
      data.items.slice(0, 6).forEach(item => {
        // IMPROVED IMAGE DETECTION
        let imageUrl = item.enclosure?.url || ""; 
        
        if (!imageUrl && (item.content || item.contentSnippet)) {
          const imgMatch = (item.content + item.contentSnippet).match(/src="([^"]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];
        }

        // FALLBACK: If no image found, use a cool wrestling background
        if (!imageUrl) {
          imageUrl = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80";
        }

        articles.push({
          source: feed.name,
          title: item.title,
          link: item.link,
          date: item.pubDate,
          image: imageUrl,
          summary: item.contentSnippet?.replace(/<[^>]*>/g, '').slice(0, 100) + "..."
        });
      });
    } catch (e) { console.log(`Skipped ${feed.name}`); }
  }

  fs.writeFileSync("./updates.json", JSON.stringify(articles, null, 2));
  console.log("🚀 Update Successful with Images!");
}
updateNews();

