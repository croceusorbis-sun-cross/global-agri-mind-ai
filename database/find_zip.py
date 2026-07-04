import os

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith(('.js', '.py', '.html', '.css', '.sql')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if "Ann Arbor" in content or "48195" in content or "48133" in content:
                        print(f"Match found in {filepath}")
            except Exception as e:
                pass
