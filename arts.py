import datetime

class Artwork:
    def __init__(self, db_dict=None):
        if db_dict is None:
            db_dict = {'title': 'SampleTitle', 'author_name': 'SampleAuthor', 'author_link': 'Empty',
                       'author_logo': 'pics/no-pic.jpg', 'work_id': '00000', 'description': 'No', 'content': []}

        self.title = db_dict['title']
        self.author_name = db_dict['author_name']
        self.author_link = db_dict['author_link']
        self.author_logo = db_dict['author_logo']
        self.description = db_dict['description']
        self.id = db_dict['work_id']
        self.add_date = datetime.datetime.utcnow()
        self.content = db_dict['content']

    def __str__(self):
        return 'Artwork Title: {};Description: {};Author: {};Author link: {};Content: {}'.format(self.title,
                                                                                                 self.description,
                                                                                                 self.author_name,
                                                                                                 self.author_link,
                                                                                                 str(self.content)
                                                                                                 .strip('[]'))

    def to_dict(self):
        return {"title": self.title, "author_name": self.author_name, "author_link": self.author_link,
                "description": self.description, "author_logo": self.author_logo, "date": self.add_date,
                "work_id": self.id, "content": self.content}


def content_show(f):
    def wrapper(*args, **kwargs):
        result = f(*args, **kwargs)
        if result:
            return [str(item) for item in result]
        else:
            return 'Empty album'
    return wrapper


class Album:
    def __init__(self, data=[]):
        self.last_upload = 'None'
        self.container = []
        if type(data) is str:
            self.title = data
        else:
            self.title = data['name']
            if len(data['pics']) > 0:
                for work in data['pics']:
                    self.container.append(Artwork(work))
                self.last_upload = self.container[-1]['date']


    def __len__(self):
        return len(self.container)

    def __getitem__(self, item):
        return self.container[item]

    def append(self, art_inst=Artwork):
        self.container.append(art_inst)
        self.last_upload = art_inst.add_date

    def remove_artwork(self, id):
        for i in range(len(self.container)):
            if self.container[i].id == id:
                self.container.pop(i)
                if len(self.container) > 0:
                    self.last_upload = self.container[-1].add_date
                else:
                    self.last_upload = "None"
                return 1
        return 0

    def pop(self, id):
        poped = 0
        for i in range(len(self.container)):
            if self.container[i].id == id:
                poped = self.container.pop(i)
                if len(self.container) > 0:
                    self.last_upload = self.container[-1].add_date
                else:
                    self.last_upload = "None"
                return poped
        return poped

    def rename(self, new_name):
        self.title = new_name

    def check_id(self, work_id):
        checker = False;
        for art in self.container:
            if art.id == work_id:
                checker = True
                break
        return checker




    @content_show
    def show_album(self):
        return self.container

    def to_dict(self):
        return {"name": self.title, "last_updated": self.last_upload, "pics": [item.to_dict() for item in self.container]}
