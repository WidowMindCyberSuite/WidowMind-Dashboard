# app/dashboard_server.py

from flask import Flask, render_template, request, jsonify
import sqlite3
import os

# Initialize Flask app
app = Flask(
    __name__,
    static_folder="static",
    template_folder="templates"
)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'widowmindcore', 'database', 'threat_log.db')

# Fetch threats from database
def fetch_threats():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            SELECT id, timestamp, source, threat_type, detail, score, status, device_ip, hostname
            FROM threats
            ORDER BY id DESC
            LIMIT 100
        """)
        rows = c.fetchall()
        conn.close()
        return rows
    except Exception as e:
        print(f"Error fetching threats: {e}")
        return []

# Main dashboard route
@app.route("/")
def index():
    threats = fetch_threats()
    return render_template("index.html", threats=threats)

# API to return threat data as JSON
@app.route("/data")
def data():
    return jsonify(fetch_threats())

# API to update threat status
@app.route("/update_status", methods=["POST"])
def update_status():
    try:
        threat_id = request.json['id']
        new_status = request.json['status']

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("UPDATE threats SET status = ? WHERE id = ?", (new_status, threat_id))
        conn.commit()
        conn.close()

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# Only run locally if needed
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port)
