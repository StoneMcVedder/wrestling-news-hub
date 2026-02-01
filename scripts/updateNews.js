import Parser from "rss-parser";
import fs from "fs";

const parser = new Parser();
const feeds = [
  { name: "WWE", url: "https://www.wwe.com/feeds/rss/news" },
  { name: "WrestlingInc", url: "https://www.wrestlinginc.com/rss/" }
];

async function updateNews() {
  let articles = [];

  for (const feed of feeds) {
    try {
      const data = await parser.parseURL(feed.url);
      data.items.slice(0, 5).forEach(item => {
        let imageUrl = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80";
        const imgMatch = item.contentSnippet?.match(/src="([^"]+)"/) || item.content?.match(/src="([^"]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];

        articles.push({
          source: feed.name,
          title: item.title,
          link: item.link,
          date: item.pubDate || new Date().toISOString(),
          image: imageUrl,
          summary: item.contentSnippet?.replace(/<[^>]*>/g, '').slice(0, 100) + "..."
        });
      });
    } catch (e) { console.log(`Skipped ${feed.name}`); }
  }

  // If both sites fail, we provide a placeholder so the site isn't blank
  if (articles.length === 0) {
    articles.push({
      source: "System",
      title: "Wrestling News Refreshing...",
      link: "#",
      date: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80",
      summary: "Feeds are currently updating. New matches and rumors coming soon!"
    });
  }

  if (!fs.existsSync('./public')) fs.mkdirSync('./public');
  fs.writeFileSync("./public/updates.json", JSON.stringify(articles, null, 2));
  console.log("🚀 Update Successful!");
}
updateNews();
