from flask import Flask, redirect, url_for, request, render_template, session, jsonify
from datetime import timedelta
import string
import random
from action_code import get_user, get_user_albums
import const
from html_templates import *
from parse_page import parse_page, get_rating, read_json_part
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
        return get_user_albums(session['user'])
    else:
        return redirect(url_for("login_page"))


@app.route('/logout')
def logout():
    session.pop("user", None)
    return redirect(url_for("login_page"))


#Some math
@app.route('/api/cells')
def get_cells():
    columns = int(request.args.get('columns'))
    rows = int(request.args.get('rows'))
    st = int(request.args.get('starts_at'))
    if st % 2 == 0:
        even_rows = math.ceil(rows / 2)
        even_count = (columns - 1) * even_rows
        odd_count = columns * (rows - even_rows)
        odd_rows1 = math.ceil((st - 1) / 2)
        even_rows1 = (st - 1) - odd_rows
        start_point_odd = columns * odd_rows1
        start_point_even = (columns - 1) * even_rows1
    else:
        odd_rows = math.ceil(rows / 2)
        odd_count = columns * odd_rows
        even_count = (columns - 1) * (rows - odd_rows)
        start_point_odd = ((st - 1) // 2) * columns
        start_point_even = ((st - 1) // 2) * (columns - 1)
    # print('add odds; indexes from {} to {}'.format(start_point_odd, start_point_odd+odd_count))
    # print('add evens; indexes from {} to {}'.format(start_point_even, start_point_even+even_count))

    result = [
        read_json_part('static/index/trendingCGS.json', start=start_point_even, end=start_point_even + even_count),
        read_json_part('static/index/trendingAS.json', start=start_point_odd, end=start_point_odd + odd_count)]

    return jsonify({'data': result})


# Creating background task to regularly update picture index
scheduler = BackgroundScheduler()
scheduler.add_job(func=get_rating, trigger="interval", minutes=const.idx_refresh_minutes)
scheduler.start()

# Removing this task at exit
atexit.register(lambda: scheduler.shutdown())

# get_rating()

app.run()
