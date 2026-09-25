import sys

with open('src/features/auth/Register.jsx', 'r') as f:
    content = f.read()

old_str = "if (!trimmedEmail) nextErrors.email = 'Email wajib diisi';"
new_str = "if (!trimmedEmail) nextErrors.email = 'Email wajib diisi';\n    else if (trimmedEmail.endsWith('@gmil.com')) nextErrors.email = 'Domain @gmil.com tidak diperbolehkan, mungkin maksud Anda @gmail.com?';"

content = content.replace(old_str, new_str)

with open('src/features/auth/Register.jsx', 'w') as f:
    f.write(content)
