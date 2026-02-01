name: Update Wrestling News

on:
  schedule:
    - cron: "0 0 */3 * *" # Runs every 3 days
  workflow_dispatch: # Allows you to run it manually whenever you want

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      # 1. Pull your code from GitHub into the bot's temporary computer
      - uses: actions/checkout@v4

      # 2. Set up Node.js (the engine)
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      # 3. INSTALL THE TOOLS (This was the missing piece!)
      - name: Install dependencies
        run: npm install

      # 4. RUN THE SCRIPT
      - name: Run update script
        run: node scripts/updateNews.js

      # 5. SAVE THE CHANGES BACK TO GITHUB
      - name: Commit and push changes
        run: |
          git config user.name "news-bot"
          git config user.email "bot@github.com"
          git add public/updates.json
          git commit -m "Auto-update wrestling news" || exit 0
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  fs.writeFileSync("./public/updates.json", JSON.stringify(articles, null, 2));
  console.log("🚀 Update Successful!");
}
updateNews();

