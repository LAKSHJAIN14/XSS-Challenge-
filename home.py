import subprocess
from flask import Flask, render_template, request, redirect, render_template_string, url_for, abort
import secrets
import random
import re
from collections import OrderedDict
app = Flask(__name__)

notes = OrderedDict()
links_dict = {}
bot_queue = []
COOKIE_NAME = "cookie"
SECRET_TOKEN = "SUPER_SECRET_ADMIN_TOKEN"
FLAG = "FAKE_FLAG"
def generate_nonce():
    return secrets.token_urlsafe(16)
HOST_URL = "http://172.31.247.162:5000"

BOT_SCRIPT_PATH = './bot.js'

# This function runs the Node.js bot.js script with the given URL
def queue_for_bot(url):
    try:
        result = subprocess.run(
            ['node', BOT_SCRIPT_PATH, url],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
            timeout=15
        )
        return result.returncode == 0
    except Exception:
        return False
    
@app.route('/')
@app.route('/home')
def hello_world():
    return render_template('home.html')

def generate_short_id():
    return str(random.randint(1, 99))


@app.route("/notes", methods=["GET", "POST"])

def save():
    if request.method == "POST":
        note_id = generate_short_id()

        for _ in range(99):
            if note_id not in notes:
                break
            note_id = generate_short_id()

        if len(notes) >= 10:
            notes.popitem(last=False)
        title = request.form["title"]
        content = request.form["content"]    
        notes[note_id] = {"title": title, "content": content}   

        return redirect(url_for("show_notes", note_id=note_id,))
    return render_template("notes.html")

@app.route("/note/<note_id>")
def show_notes(note_id):
    note = notes.get(note_id)
    if not note or not isinstance(note, dict):
        return "Note not found.", 404
    nonce = generate_nonce()
    return render_template("note.html", note_id=note_id, title=note["title"], content=note["content"], nonce = nonce)


@app.route("/report", methods=["GET", "POST"])
def report():
    if request.method == "POST":
        url = request.form.get("link", "")
        pattern = r"^" + re.escape(HOST_URL) + r"/note/([1-9]|[1-9][0-9])$"
        if re.match(pattern, url):
            queue_for_bot(url)
        
            note_id = url.split("/")[-1]  
            links_dict[note_id] = url
        
    
            if len(links_dict) > 10:
                links_dict.pop(next(iter(links_dict)) ) 
            return "Thanks! The note will be reviewed soon."
        else:
            return "Invalid link. Please submit a note link like this 'http://127.0.0.1:5000/note/<id>' only.", 400  
    return render_template('report.html')
@app.route('/flag')
def hello_flag():
    if request.cookies.get(COOKIE_NAME) == SECRET_TOKEN:
        return FLAG
    else:
        abort(403)

if __name__ == "__main__":
      app.run(host="0.0.0.0",port=5000, debug=True)    