with open('src/pages/Home.jsx', 'r') as f:
    content = f.read()

content = content.replace("  {\n    emoji: '🌐',", "  },\n  {\n    emoji: '🌐',")

with open('src/pages/Home.jsx', 'w') as f:
    f.write(content)
