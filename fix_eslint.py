import re

# CustomerSidebar.jsx
path_sidebar = r'd:\MAGANG\Nebeng\nebeng-frontend\src\features\customer\components\CustomerSidebar.jsx'
with open(path_sidebar, 'r', encoding='utf-8') as f:
    c = f.read()
c = re.sub(r',\s*Menu\s*,', ',', c)
c = re.sub(r',\s*X\s*', '', c)
c = re.sub(r'const \{ isMobileOpen, setIsMobileOpen \} = useCustomerLayout\(\);', 'const { setIsMobileOpen } = useCustomerLayout();', c)
with open(path_sidebar, 'w', encoding='utf-8') as f:
    f.write(c)

# CustomerTopbar.jsx
path_topbar = r'd:\MAGANG\Nebeng\nebeng-frontend\src\features\customer\components\CustomerTopbar.jsx'
with open(path_topbar, 'r', encoding='utf-8') as f:
    c = f.read()
c = re.sub(r'useRef,\s*', '', c)
c = re.sub(r',\s*useCallback', '', c)
c = re.sub(r',\s*ChevronDown\s*,', ',', c)
c = re.sub(r',\s*User\s*,', ',', c)
c = re.sub(r',\s*Settings\s*,', ',', c)
c = re.sub(r',\s*Bell\s*', '', c)
c = re.sub(r'const PRIMARY_COLOR = ''#10367D'';\n', '', c)
c = re.sub(r'catch \(err\) \{\}', 'catch (e) { /* ignore */ }', c)
with open(path_topbar, 'w', encoding='utf-8') as f:
    f.write(c)

# MyTickets.jsx
path_mytickets = r'd:\MAGANG\Nebeng\nebeng-frontend\src\features\customer\views\MyTickets.jsx'
with open(path_mytickets, 'r', encoding='utf-8') as f:
    c = f.read()
c = re.sub(r'const handlePayNow = \(ticket\) => \{.*?\};', '', c, flags=re.DOTALL)
c = re.sub(r'const handleCheckStatus = async \(ticket\) => \{.*?\};', '', c, flags=re.DOTALL)
with open(path_mytickets, 'w', encoding='utf-8') as f:
    f.write(c)
