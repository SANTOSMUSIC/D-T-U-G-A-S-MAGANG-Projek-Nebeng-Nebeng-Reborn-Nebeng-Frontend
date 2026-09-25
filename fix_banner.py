import sys

with open('src/components/ui/BannerSlider.jsx', 'r') as f:
    content = f.read()

old_prev = 'className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"'
new_prev = 'className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-1.5 md:p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"'

old_next = 'className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"'
new_next = 'className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-1.5 md:p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"'

content = content.replace(old_prev, new_prev)
content = content.replace(old_next, new_next)

with open('src/components/ui/BannerSlider.jsx', 'w') as f:
    f.write(content)
