import pymongo
from arts import *
import const
cStr = const.cStr


def db_conn(conn_str):
    password = const.password
    return pymongo.MongoClient(conn_str.format(password))


def add_user(username, password):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    if users.find_one({"_id": username}) is None:
        user = {"_id": username, "password": password, "albums": []}
        x = users.insert_one(user)
        if x.acknowledged:
            print("User '{}' created successfully".format(username))
        else:
            print("Unexpected error")
    else:
        print("Username already exists")
    client.close()


def get_user(username, password):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    data = users.find_one({"_id": username, "password": password})
    client.close()
    if data is None:
        return 0
    else:
        return 1


def get_user_albums(username):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    data = users.find_one({"_id": username}, {"albums": 1, "_id": 0})['albums']
    markup = ""
#    for album in data:
#        pass
    client.close()
    return '<div style="display: inline-flex;">{}</div>'.format(markup)


def get_album(username, album_name):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    try:
        data = users.find_one({"_id": username, "albums.name": album_name}, {"albums.$": 1, "_id": 0})['albums'][0]
        temp_album = Album(data)
        client.close()
        return temp_album
    except Exception as ex:
        print("Failed to get album", ex.args)
        client.close()
        return None


def rename_album(username, album_name, name):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    if users.find_one({"_id": username, "albums.name": album_name}) is None:
        print("Album not found")
        client.close()
        return -1
    album_list = users.find_one({"_id": username})["albums"]
    for al in album_list:
        if al['name'] == name:
            print('Album with this name already exists')
            client.close()
            return 0
    else:
        try:
            users.update_one({"_id": username, "albums.name": album_name}, {"$set": {"albums.$.name": name}})
            print("Album '{}' renamed to '{}'".format(album_name, name))
            client.close()
            return 1
        except Exception as ex:
            print("Unexpected error", ex)
    client.close()
    return -2


def add_album(username, album_name):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    if users.find_one({"_id": username, "albums.name": album_name}) is not None:
        print("Album with name {} already exists".format(album_name))
        client.close()
        return 0
    temp_material = Album(album_name)
    album_list = users.find_one({"_id": username})["albums"]
    album_list.append(temp_material.to_dict())
    try:
        users.update_one({"_id": username}, {"$set": {"albums": album_list}})
        print("album '{}' successfully added for user '{}'".format(album_name, username))
    except Exception as ex:
        print("Failed to add album", ex.args)
    client.close()


def check_work_id(username, work_id):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    album_list = users.find_one({"_id": username})["albums"]
    for alb in album_list:
        temp_alb = Album(alb)
        if temp_alb.check_id(work_id):
            break
    else:
        client.close()
        return False
    client.close()
    return True

#Check for repeating artworks
def add_pic(username, album_name, pic_dict):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    temp_album = get_album(username, album_name)
    if temp_album.check_id(pic_dict['work_id']):
        print('Artwork already exist in ths album')
        return 0
    temp_album.append(Artwork(pic_dict))
    try:
        users.update_one({"_id": username, "albums.name": album_name}, {"$set": {"albums.$": temp_album.to_dict()}})
        print("Pic successfully added")
    except Exception as ex:
        print("Pic addition failed", ex)
    client.close()

def remove_pic(username, album_name, pic_index):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    temp_album = get_album(username, album_name)
    if len(temp_album) <= pic_index:
        print("Index out of range")
        client.close()
        return 0
    try:
        temp_album.remove_at(pic_index)
        users.update_one({"_id": username, "albums.name": album_name}, {"$set": {"albums.$": temp_album.to_dict()}})
        print("Deletion successful")
    except Exception as ex:
        print("Unexpected error upon picture deletion", ex)
    client.close()


#TO DO : album merge function
def remove_album(username, album_name):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    data = users.find_one({"_id": username})['albums']
    deleted = [i for i in data if not (i['name'] == album_name)]
    if(len(deleted) == len(data)):
        print("Album not found")
    else:
        try:
            users.update_one({"_id": username}, {"$set": {"albums": deleted}})
            print("Album successfully deleted")
        except Exception as ex:
            print("Unexpected error", ex)
    client.close()


def move_picture(username, from_album, to_album, pic_index):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    temp_from = get_album(username, from_album)
    temp_to = get_album(username, to_album)
    try:
        temp_to.append(temp_from.pop(pic_index))
        users.update_one({"_id": username, "albums.name": to_album}, {"$set": {"albums.$": temp_to.to_dict()}})
        users.update_one({"_id": username, "albums.name": from_album}, {"$set": {"albums.$": temp_from.to_dict()}})
        print("Picture successfully moved from '{}' to '{}'".format(from_album, to_album))
    except Exception as ex:
        print("Failed to move picture ({})".format(ex))
    client.close()


pic = {"title": "pic_test3", "author_name":
        "author_test", "author_link": "vk.com/alfren_test", "description": "some txt",
       "author_logo": "https://sun4-16.userapi.com/xvVvy37Jp9JWuQ3__IkE3nrlfvgxzpHZ9S2i8Q/C_E3z5Hbioo.jpg",
       "work_id": "00000", "content":
    [
        "https://sun5-4.userapi.com/Vg7ZhKcexy7_NyKj4h25M1RZ_tLw1HAD1H1sDA/TQtA6UMmooU.jpg",
        "https://sun5-4.userapi.com/rik3RC8xb919llVsZRbWa90JMZPfIjAgODm5hQ/NJyAD4AjSC0.jpg"
    ]}


#print(check_work_id("test1", "abcdf1"))
#add_pic("test1", "sample one", pic)
#rename_album("test1", "sample one1", "sample one")
# move_picture("test1", "sample one", "test_album", 3)
