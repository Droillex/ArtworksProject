from flask import Flask, redirect, url_for, request, render_template, session, jsonify
from datetime import timedelta
import string
import random
from action_code import *
import const
from parse_page import parse_page, get_rating, read_json_part, handle_artwork
import math
import json


import atexit
import apscheduler
from apscheduler.schedulers.background import BackgroundScheduler


def generate_key(stringLength=8):
    chars = string.ascii_letters + string.digits
    return ''.join((random.choice(chars) for i in range(stringLength)))


key = generate_key(12)
app = Flask(__name__, static_url_path='', static_folder='static/')
app.secret_key = key
app.permanent_session_lifetime = timedelta(hours=const.session_hours)
app.config['JSON_AS_ASCII'] = False


@app.route('/')
@app.route('/index')
def main_page():
    return render_template('index.html')


@app.route(const.login, methods=["POST", "GET"])
def login_page():
    if request.method == "POST":
        username = request.form['nm']
        password = request.form['pw']
        if get_user(username, password) != 0:
            session.permanent = True
            session["user"] = username
            return redirect(url_for("user_page"))
        else:
            return render_template('demoLogin.html')
    else:
        if "user" in session:
            return redirect(url_for("user_page"))
        return render_template('demoLogin.html')


@app.route(const.user)
def user_page():
    if "user" in session:
        return render_template('albums.html')
        #return get_user_albums(session['user'])
    else:
        return redirect(url_for("login_page"))


@app.route('/logout')
def logout():
    session.pop("user", None)
    return redirect(url_for("login_page"))

#return artwork
@app.route('/artwork')
def artworks_page():
    artwork_id = str(request.args.get('id'))
    return handle_artwork(artwork_id)




#Some math
@app.route('/api/cells')
def get_cells():
    try:
        columns = int(request.args.get('columns'))
        rows = int(request.args.get('rows'))
        st = int(request.args.get('starts_at'))
        count = [int(x) for x in request.args.get('cnt').split(',')]
    except Exception as ex:
        print(ex)
        #Redirect 404
        return ""

    if st % 2 == 0:
        even_rows = math.ceil(rows / 2)
        even_count = (columns - 1) * even_rows
        odd_count = columns * (rows - even_rows)
    else:
        odd_rows = math.ceil(rows / 2)
        odd_count = columns * odd_rows
        even_count = (columns - 1) * (rows - odd_rows)

    # print('add odds; indexes from {} to {}'.format(start_point_odd, start_point_odd+odd_count))
    # print('add evens; indexes from {} to {}'.format(start_point_even, start_point_even+even_count))

    result = [
        read_json_part('static/index/CGtrending.json', start=count[0], end=count[0] + even_count),
        read_json_part('static/index/AStrending.json', start=count[1], end=count[1] + odd_count)]

    return jsonify({'data': result})


@app.route('/api/get_albums')
def get_albums():
    if 'user' in session:
        return jsonify(get_user_albums(session['user']))
    else:
        return None

@app.route('/api/rename_album')
def rename_alb():
    name = request.args.get('name')
    n_name = request.args.get('new_name')
    if 'user' in session:
        resp = {"-1": "Name is too long", "-2": "Album not found", "0": "Album with this name already exists",
                "1": "Done", "-3": "Unexpected error"}
        res = rename_album(session['user'], name, n_name)
        return jsonify({"code": res, "message": resp[str(res)]})
    else:
        return None





# Creating background task to regularly update picture index
scheduler = BackgroundScheduler()
scheduler.add_job(func=get_rating, trigger="interval", minutes=const.idx_refresh_minutes)
scheduler.start()

# Removing this task at exit
atexit.register(lambda: scheduler.shutdown())

#get_rating()

app.run()
