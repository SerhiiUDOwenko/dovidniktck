import os
import re
import json

def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    return match.group(0) if match else ""

def clean_entry(raw):
    entry = {}
    for line in raw.strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip().replace('"', '').replace("'", "")
            value = value.strip().replace('"', '').replace("'", "")
            if key == "phone":
                entry["phone"] = [v.strip() for v in value.split(',') if v.strip()]
                entry["email"] = extract_email(value)
            else:
                entry[key] = value
    for field in ["name", "region", "phone", "email"]:
        entry.setdefault(field, "" if field != "phone" else [])
    return entry

def parse_raw_json_like(text):
    blocks = re.findall(r'\{[^{}]+\}', text, re.DOTALL)
    cleaned = []
    for block in blocks:
        cleaned.append(clean_entry(block))
    return cleaned

def find_tzk_file(directory):
    for filename in os.listdir(directory):
        if "tzk" in filename.lower() and filename.lower().endswith(".json"):
            return os.path.join(directory, filename)
    return None

# === Визначення директорії ===
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(script_dir, ".."))

# === Пошук файлу ===
source_path = find_tzk_file(project_root)
if not source_path:
    print("📁 Вміст директорії:")
    print(os.listdir(project_root))
    raise FileNotFoundError("❌ Файл із назвою, що містить 'tzk' і закінчується на '.json', не знайдено.")

output_path = os.path.join(project_root, "tzk_clean.json")

# === Зчитування ===
with open(source_path, "r", encoding="utf-8") as f:
    raw_text = f.read()

# === Обробка ===
data = parse_raw_json_like(raw_text)

# === Запис у валідний JSON ===
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Знайдено файл: {os.path.basename(source_path)}")
print(f"✅ Успішно збережено {len(data)} записів у {output_path}")
