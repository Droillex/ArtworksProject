from flask import Flask, redirect, url_for, request, render_template, session, jsonify, abort
from datetime import timedelta
import string
import random
from action_code import *
import const
from parse_page import parse_page, get_rating, read_json_part, handle_artwork, check_route
import math
import json
from arts import *

import atexit
import apscheduler
from apscheduler.schedulers.background import BackgroundScheduler


key = const.password
app = Flask(__name__, static_url_path='', static_folder='static/')
app.secret_key = key
app.permanent_session_lifetime = timedelta(hours=const.session_hours)
app.config['JSON_AS_ASCII'] = False


@app.route('/')
@app.route('/index')
def main_page():
    return render_template('index.html')


@app.route(const.login, methods=["POST"])
def login():
    username = request.args.get('nm')
    password = request.args.get('pw')
    if get_user(username, password) != 0:
        session.permanent = True
        session["user"] = username
        return {'code': '1', 'message': 'success'}
    else:
        return {'code': '0', 'message': 'incorrect username or password'}


@app.route('/register', methods=["POST"])
def reg():
    username = request.args.get('nm')
    password = request.args.get('pw')
    code = add_user(username, password)
    if code == 1:
        session.permanent = True
        session["user"] = username
        return {'code': '1', 'message': 'success'}
    else:
        errors = {0: 'User already exist', -1: 'Char limit!', -2: 'Unexpected error'}
        return {'code': '0', 'message': errors[code]}


@app.route(const.user)
def user_page():
    if "user" in session:
        return render_template('albums.html')
    else:
        return redirect(url_for("main_page"))


@app.route('/logout')
def logout():
    session.pop("user", None)
    return redirect(request.referrer)


# return artwork
@app.route('/artwork', methods=["POST", "GET"])
def artworks_page():
    artwork_id = str(request.args.get('id'))
    if request.method == "GET":
        if len(artwork_id) == 0:
            abort(404)
        if request.method == "GET":
            if check_route(artwork_id):
                return render_template('working.html')
            else:
                abort(404)
    else:
        return handle_artwork(artwork_id)

# Some math
@app.route('/api/cells')
def get_cells():
    try:
        columns = int(request.args.get('columns'))
        rows = int(request.args.get('rows'))
        st = int(request.args.get('starts_at'))
        count = [int(x) for x in request.args.get('cnt').split(',')]
    except Exception as ex:
        print(ex)
        return ""

    if st % 2 == 0:
        even_rows = math.ceil(rows / 2)
        even_count = (columns - 1) * even_rows
        odd_count = columns * (rows - even_rows)
    else:
        odd_rows = math.ceil(rows / 2)
        odd_count = columns * odd_rows
        even_count = (columns - 1) * (rows - odd_rows)
    result = [
        read_json_part('static/index/CGtrending.json', start=count[0], end=count[0] + even_count),
        read_json_part('static/index/AStrending.json', start=count[1], end=count[1] + odd_count)]

    return jsonify({'data': result})


@app.route('/api/get_albums', methods=["POST"])
def get_albums():
    name = request.args.get('name')
    if 'user' in session:
        if name is None:
            albs = get_user_albums(session['user'])
            return jsonify({"data": albs, "user": session['user'], "code": "1"})
        else:
            alb = get_album(session['user'], name)
            return jsonify({"data": [alb.to_dict()], "code": "1", "user": session['user']})
    else:
        return jsonify({"code": "-100", "message": "There are no user in session"})


@app.route('/api/rename_album', methods=["POST"])
def rename_alb():
    name = request.args.get('name')
    n_name = request.args.get('new_name')
    if 'user' in session:
        resp = {"-1": "Name is too long", "-2": "Album not found", "0": "Album with this name already exists",
                "1": "Done", "-3": "Unexpected error"}
        res = rename_album(session['user'], name, n_name)
        return jsonify({"code": str(res), "message": resp[str(res)]})
    else:
        return jsonify({"code": "-100", "message": "There are no user in session"})


@app.route('/api/remove_album', methods=["POST"])
def remove_alb():
    name = request.args.get('name')
    if 'user' in session:
        resp = {"-1": "Unexpected error", "0": "Album not found",
                "1": "Done"}
        res = remove_album(session['user'], name)
        return jsonify({"code": str(res), "message": res})
    else:
        return jsonify({"code": "-100", "message": "There are no user in session"})


@app.route('/api/add_album', methods=["POST"])
def add_alb():
    name = request.args.get('name')
    if 'user' in session:
        resp = {"-2": "Name is too short", "-1": "Name is too long", "0": "Album already exist",
                "1": "Done"}
        res = add_album(session['user'], name)
        return jsonify({"code": str(res), "message": resp[str(res)]})
    else:
        return jsonify({"code": "-100", "message": "There are no user in session"})


@app.route('/api/log_check', methods=["POST"])
def logcheck():
    if 'user' in session:
        return jsonify({'res': session['user']})
    else:
        return jsonify({'res': '0'})


@app.route('/api/album_list', methods=["POST"])
def alb_lst():
    if 'user' in session:
        res = []
        work_id = request.args.get('id')
        albums = get_user_albums(session['user'])
        for alb in albums:
            temp_alb = Album(alb)
            res.append({'name': temp_alb.title, 'status': str(temp_alb.check_id(work_id))})
        return {'data': res, 'status': '1'}
    else:
        return {'data':[], 'status': '0'}


@app.route('/api/add_art', methods=["POST"])
def add_artwork():
    work_id = request.args.get('id')
    alb = request.args.get('alb_name')
    if 'user' in session and work_id and alb:
        res = handle_artwork(work_id)
        if res['work_id'] == 'error':
            return {'status': 'error'}
        else:
            r = add_pic(session['user'], alb, res)
            return {'status': r}
    else:
        return jsonify({"code": "0", "message": "There are no user in session"})


@app.route('/api/remove_art', methods=["POST"])
def remove_artwork():
    work_id = request.args.get('id')
    alb = request.args.get('alb_name')
    if 'user' in session and work_id and alb:
        res = handle_artwork(work_id)
        if res['work_id'] == 'error':
            return {'status': 'error'}
        else:
            r = remove_pic(session['user'], alb, work_id)
            return {'status': r}
    else:
        return jsonify({"code": "0", "message": "There are no user in session"})


# Creating background task to regularly update picture index
scheduler = BackgroundScheduler()
scheduler.add_job(func=get_rating, trigger="interval", minutes=const.idx_refresh_minutes)
scheduler.start()

# Removing this task at exit
atexit.register(lambda: scheduler.shutdown())

# get_rating()

# app.run()
