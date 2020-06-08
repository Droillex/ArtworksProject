import requests
import json
import datetime
import math
import time

# Rounding function
def rounder(value):
    frac, whole = math.modf(value)
    if frac >= 0.5:
        return int(whole+1)
    else:
        return int(whole)


# def posted_ago(value):
#     calc = rounder(value / 3600)
#     if calc > 0:
#         return calc, 'hours'
#     else:
#         calc = rounder(value / 60)
#         if calc > 0:
#             return calc, 'minutes'
#         else:
#             return value, 'seconds'



# Parsing single artstation work
def parse_artstation_work(res):
    desc = res['description']
    result = {
        'title': res['title'],
        'description': desc[3:len(desc) - 4],
        'author_name': res['user']['username'],
        'author_link': res['user']['permalink'],
        'author_logo': res['user']['medium_avatar_url'],
        'content': []
    }
    for img in res['assets']:
        if img['asset_type'] != 'video_clip':
            result['content'].append(img['image_url'])
    return result

# Parsing single cgsociety work
def parse_cgsociety_work(res):
    result = {
        'title': res['data']['attributes']['title'],
        'description': res['data']['attributes']['description'],
        'author_name': res['included'][0]['attributes']['username'],
        'author_link': res['included'][0]['attributes']['user_root_url'],
        'author_logo': res['included'][0]['attributes']['avatar_thumb'],
        'content': []
    }

    for item in res['included']:
        if item['type'] == 'works':
            result['content'].append(item['attributes']['original_url'])
        else:
            continue
    return result


# Collecting Recent (quality filter), rest from featured
def cgsociety_collect(btm=1, top=180, json_url='', pages=0, op=''):
    ct = []
    hp = 3
    for j in range(pages):
        hit = False
        json_url += '&page={}'.format(j+1)
        r = requests.get(json_url)
        res = json.loads(r.text)
        if r.status_code == 200:
            for i in range(len(res['data'])):
                pub_at = res['data'][i]['attributes']['created_at'].split('T')
                date_info = {
                    'year': int(pub_at[0].split('-')[0]),
                    'month': int(pub_at[0].split('-')[1]),
                    'day': int(pub_at[0].split('-')[2]),
                    'hour': int(pub_at[1].split(':')[0]),
                    'minute': int(pub_at[1].split(':')[1]),
                }
                dat = datetime.datetime(date_info['year'], date_info['month'], date_info['day'], date_info['hour'],
                                        date_info['minute'])
                offset = (datetime.datetime.utcnow() - dat).total_seconds() / 86400
                if op == 'recent':
                    if btm <= offset and res['data'][i]['attributes']['likes_count'] >= 2 \
                            and res['data'][i]['attributes']['views_count'] > 10:
                        ct.append([round(offset), res['data'][i]['attributes']['views_count'],
                                   res['data'][i]['attributes']['channel_url'],
                                   res['data'][i]['attributes']['title'],
                                   res['data'][i]['attributes']['view_image_url']])
                elif op == 'featured':
                    if offset <= top:
                        pic_url = res['data'][i]['attributes']['channel_url']
                        title = res['data'][i]['attributes']['title']
                        page_url = res['data'][i]['attributes']['view_image_url']
                        if offset > 7:
                            ct.append([round(offset), res['data'][i]['attributes']['views_count'],
                                       pic_url,
                                       title,
                                       page_url])

                        hit = True

        if op == 'featured':
            if hit:
                hp = 3
            else:
                hp -= 1
                if hp == 0:
                    break
        else:
            pass
            # If error while collecting json

    return ct

# Returns part of JSON file
def read_json_part(path, start=0, end=0):
    data = json.loads(open(path).read())[start:end]
    if path.split('/')[-1][:2] != 'CG':
        for item in data:
            item['link'] = '/artwork?id={}'.format(item['link'][8:].split('/')[-1])
    else:
        for item in data:
            item['link'] = '/artwork?id={}'.format(item['link'][8:].split('/')[-2])
    return data


def handle_artwork(artwork_id):

    if len(artwork_id) == 4:
        r = requests.get('https://cgsociety.org/api/images/{}?user_details=true'.format(artwork_id))
        if r.status_code == 200:
            res = json.loads(r.text)
            return parse_cgsociety_work(res)
        else:
            return {"status": "error"}
    else:
        r = requests.get('https://artstation.com/projects/{}.json'.format(artwork_id))
        if r.status_code == 200:
            res = json.loads(r.text)
            return parse_artstation_work(res)
        else:
            return {"status": "error"}



def check_route(artwork_id):
    if len(artwork_id) == 4:
        r = requests.get('https://cgsociety.org/api/images/{}?user_details=true'.format(artwork_id))
    else:
        r = requests.get('https://artstation.com/projects/{}.json'.format(artwork_id))
    if r.status_code == 200:
        return True
    else:
        return False


# Parsing detailed page with one artwork
def parse_artwork(json_url):
    site = json_url[8:].split('/')[0]

    url = json_url
    r = requests.get(json_url)

    if(r.status_code == 200):
        res = json.loads(r.text)
        funcs = {
            'artstation.com': parse_artstation_work,
            'cgsociety.org': parse_cgsociety_work
        }
        return funcs[site](res)

    else:
        print("failed")


#For parsing pages with multiple artworks
def parse_page(json_url, rng=1):
    urls = []
    counter = {}
    site = json_url[8:].split('/')[0]
    if site == 'cgsociety.org':
        r = requests.get(json_url)
        res = json.loads(r.text)
        ct = cgsociety_collect(json_url=json_url, pages=res['meta']['total_pages'], op='recent')
        sorting = sorted(ct, key=lambda x: (x[0], -x[1]))
        for sublist in sorting:
            urls.append({'img_url': sublist[2], 'title': sublist[3], 'link': sublist[4]})
        json_url = 'https://cgsociety.org/api/channels/featured/images?category=&channel_slug=featured&genre=&per_page=20'
        r = requests.get(json_url)
        res = json.loads(r.text)
        feat = cgsociety_collect(json_url=json_url, pages=res['meta']['total_pages'], op='featured')
        sorting = sorted(feat, key=lambda x: (x[0], -x[1]))
        for sublist in sorting:
            urls.append({'img_url': sublist[2], 'title': sublist[3], 'link': sublist[4]})

    else:
        for j in range(rng):
            json_url += '&page={}'.format(j+1)
            r = requests.get(json_url)
            if r.status_code == 200:
                res = json.loads(r.text)
                for i in range(len(res['data'])):
                    pub_at = res['data'][i]["published_at"].split('T')
                    date_info = {
                        'year': int(pub_at[0].split('-')[0]),
                        'month': int(pub_at[0].split('-')[1]),
                        'day': int(pub_at[0].split('-')[2]),
                        'hour': int(pub_at[1].split(':')[0]),
                        'minute': int(pub_at[1].split(':')[1]),
                    }
                    dat = datetime.datetime(date_info['year'], date_info['month'], date_info['day'], date_info['hour'],
                                            date_info['minute'])
                    counter[dat.date()] = counter.get(dat.date(), 0) + 1

                    # diff = (datetime.datetime.utcnow() + datetime.timedelta(hours=-5)) - dat
                    # if rounder(diff.total_seconds()/3600) > 0:
                    #    val = rounder(diff.total_seconds()/3600)
                    #    avg = res['data'][i]['likes_count']/val
                    # print("Средние лайки за час: {}, часов назад: {}".format(avg, val))

                    urls.append({'img_url': res['data'][i]['cover']['small_square_url'],
                                 'title': res['data'][i]['title'],
                                 'link': res['data'][i]['permalink']})
            else:
                pass
                # If error


        #sorted_urls = sorted(urls, key=lambda k: k['avg_likes'], reverse=True)
        #new_list = [{k: v for k, v in d.items() if k != 'avg_likes'} for d in sorted_urls]
    #print(counter)

    #print(len(urls))

    return urls

# Creating local index by writing JSON files
def get_rating():
    start = time.time()
    cgs_urls = parse_page('https://cgsociety.org/api/channels/recent/images?category=&channel_slug=recent&genre'
                          '=&per_page=20')
    with open('static/index/CGtrending.json', 'w') as fp:
        json.dump(cgs_urls, fp)
    as_urls = parse_page('https://artstation.com/projects?sorting=trending', rng=40)
    with open('static/index/AStrending.json', 'w') as fp:
        json.dump(as_urls, fp)
    end = time.time()
    #print(end-start)
    #print("-----------------FINISHED------------------")




#parseArtwork('https://artstation.com/projects/6arYQw.json')
#parse_page('https://artstation.com/projects?sorting=trending')
#parse_page('https://cgsociety.org/api/channels/recent/images?category=&channel_slug=recent&genre=&per_page=20')
#print(parseArtwork('https://cgsociety.org/api/images/r80t?user_details=false'))
#print(datetime.datetime.utcnow() + datetime.timedelta(hours=-4))
#parse_page('https://cgsociety.org/api/channels/featured/images?category=&channel_slug=featured&genre=&per_page=20', 20)
#get_rating()