import os, json

materials_dir = "materials"
compounds = {}

for name in os.listdir(materials_dir):
    path = os.path.join(materials_dir, name)
    if os.path.isdir(path):
        # crude element extraction from formula (uppercase + optional lowercase)
        import re
        elements = re.findall(r"[A-Z][a-z]?", name)
        compounds[name] = {"elements": elements}

with open("compounds.json", "w") as f:
    json.dump(compounds, f, indent=2)

print("✅ compounds.json generated with", len(compounds), "materials.")
