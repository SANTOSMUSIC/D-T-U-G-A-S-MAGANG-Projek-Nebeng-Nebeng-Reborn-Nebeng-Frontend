import sys

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"Not found in {filepath}")

# 1. CustomerTopbar
replace_in_file(
    'src/features/customer/components/CustomerTopbar.jsx',
    'className="w-9 h-9 rounded-full bg-[#10367D] flex items-center justify-center text-white hover:bg-[#0C2C66] transition font-bold text-[14px] cursor-pointer overflow-hidden"',
    'className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-[#10367D] flex items-center justify-center text-white hover:bg-[#0C2C66] transition font-bold text-[14px] cursor-pointer overflow-hidden"'
)

# 2. MitraTopbar
replace_in_file(
    'src/features/mitra/components/MitraTopbar.jsx',
    'className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden"',
    'className="w-9 h-9 md:w-7 md:h-7 rounded-full text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden"'
)

# 3. OperatorTopBar
replace_in_file(
    'src/features/operator-pos/components/OperatorTopBar.jsx',
    'className="w-8 h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center overflow-hidden"',
    'className="w-10 h-10 md:w-8 md:h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center overflow-hidden"'
)

