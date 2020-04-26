import pymongo
from arts import *

cStr = "mongodb+srv://Droillex:{}@testcluster-uuesm.mongodb.net/test?retryWrites=true&w=majority"


def db_conn(conn_str):
    password = input("Input password : ")
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


def add_album(username, album_name):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    al = Album(album_name)
    album_list = users.find_one({"_id": username})["albums"]
    album_list.append(al.to_dict())
    try:
        users.update_one({"_id": username}, {"$set": {"albums": album_list}})
        print("album '{}' successfully added for user '{}'".format(album_name, username))
    except Exception as ex:
        print("Failed to add album", ex.args)
    client.close()


def read_album(username, album_name):
    client = db_conn(cStr)
    users = client["test_db"]["users"]
    al = None
    try:
        temp_dict = next(item for item in users.find_one({"_id": username})["albums"] if item["name"] == album_name)
        al = Album(temp_dict['name'], temp_dict['pics'])
        print(al.show_album())
    except Exception as ex:
        print("Failed to find album", ex.args)
    client.close()
    return al




# add_user("test2", "lel")
#add_album("test2", "aaaaaaaaaaaaand another one")
read_album("test1", "test album")
