import re

with open('src/pages/Home.jsx', 'r') as f:
    content = f.read()

# 1. Move Ecosistema AURA to the first position in TEMPLATES
ecosystem_item = r"""  {
    emoji: '🌐',
    label: 'Ecosistema AURA',
    id: 'ecosistema-aura',
    color: '#0891b2',
    isEcosystem: true
  },
"""

if ecosystem_item in content:
    # remove it from its current position
    content = content.replace(ecosystem_item, "")
    # add it after const TEMPLATES = [
    content = content.replace("const TEMPLATES = [", "const TEMPLATES = [\n" + ecosystem_item)


# 2. Fix the white box style
old_box = """<div style={{ position: 'absolute', bottom: '15%', background: '#fff', padding: '0.2rem 0.8rem', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ color: '#7c3aed', fontWeight: 900, fontSize: '1.2rem', lineHeight: 1 }}>AURA</div>
                    <div style={{ color: '#000', fontSize: '0.45rem', fontWeight: 700, letterSpacing: '0.05em' }}>AI AGENTS FOR BUSINESS</div>
                  </div>"""

new_box = """<div style={{ position: 'absolute', bottom: '8%', background: '#fff', padding: '0.4rem 1rem', borderRadius: '0.75rem', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.6)', width: '85%' }}>
                    <div style={{ background: 'linear-gradient(135deg, #7c3aed, #0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1, marginBottom: '2px' }}>AURA</div>
                    <div style={{ color: '#3f3f50', fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>AI AGENTS FOR BUSINESS</div>
                  </div>"""

content = content.replace(old_box, new_box)

with open('src/pages/Home.jsx', 'w') as f:
    f.write(content)
