from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
# Разрешаем доступ с твоего GitHub
CORS(app)

DB_FILE = 'players_data.json'

def load_db():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

@app.route('/get_player/<int:user_id>', methods=['GET'])
def get_player(user_id):
    db = load_db()
    uid = str(user_id)
    if uid not in db:
        db[uid] = {"hero": None, "gold": 1500, "level": 1}
        save_db(db)
    return jsonify(db[uid])

@app.route('/set_hero/<int:user_id>/<string:hero_id>', methods=['POST'])
def set_hero(user_id, hero_id):
    db = load_db()
    uid = str(user_id)
    if uid not in db:
        db[uid] = {"gold": 1500, "level": 1}
    db[uid]["hero"] = hero_id
    save_db(db)
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
