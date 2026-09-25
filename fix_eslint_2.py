import re

path_sidebar = r'd:\MAGANG\Nebeng\nebeng-frontend\src\features\customer\components\CustomerSidebar.jsx'
with open(path_sidebar, 'r', encoding='utf-8') as f: c = f.read()
c = re.sub(r'const \{ isMobileOpen, setIsMobileOpen \} = useCustomerLayout\(\);', 'const { setIsMobileOpen } = useCustomerLayout();', c)
with open(path_sidebar, 'w', encoding='utf-8') as f: f.write(c)

path_topbar = r'd:\MAGANG\Nebeng\nebeng-frontend\src\features\customer\components\CustomerTopbar.jsx'
with open(path_topbar, 'r', encoding='utf-8') as f: c = f.read()
c = re.sub(r',\s*ChevronDown\s*,', ',', c)
c = re.sub(r',\s*ChevronDown\s*', '', c)
c = re.sub(r'const PRIMARY_COLOR = ''#10367D'';\n', '', c)
c = re.sub(r'catch \(e\) \{ /\* ignore \*/ \}', 'catch { /* ignore */ }', c)
with open(path_topbar, 'w', encoding='utf-8') as f: f.write(c)

path_mytickets = r'd:\MAGANG\Nebeng\nebeng-frontend\src\features\customer\views\MyTickets.jsx'
with open(path_mytickets, 'r', encoding='utf-8') as f: c = f.read()
c = re.sub(r'const handlePayNow = .*?\n  \};\n', '', c, flags=re.DOTALL)
with open(path_mytickets, 'w', encoding='utf-8') as f: f.write(c)
