class Artwork:
    def __init__(self, db_dict=None):
        if db_dict is None:
            db_dict = {'title': 'SampleTitle', 'author_name': 'SampleAuthor', 'author_link': 'Empty',
                       'description': 'No', 'content': []}

        self.title = db_dict['title']
        self.author_name = db_dict['author_name']
        self.author_link = db_dict['author_link']
        self.description = db_dict['description']
        self.content = db_dict['content']

    def __str__(self):
        return 'Artwork Title: {};Description: {};Author: {};Author link: {};Content: {}'.format(self.title,
                                                                                                 self.description,
                                                                                                 self.author_name,
                                                                                                 self.author_link,
                                                                                                 str(self.content)
                                                                                                 .strip('[]'))

    def to_dict(self):
        return {"title": self.title, "author_name": self.author_name, "author_link": self.author_link, "description":
                self.description, "content": self.content}


def content_show(f):
    def wrapper(*args, **kwargs):
        result = f(*args, **kwargs)
        if result:
            return [str(item) for item in result]
        else:
            return 'Empty album'
    return wrapper


class Album:
    def __init__(self, init_title="No title", content=[]):
        self.title = init_title
        self.container = []
        if len(content) > 0:
            for work in content:
                self.container.append(Artwork(work))

    def __len__(self):
        return len(self.container)

    def __getitem__(self, item):
        return self.container[item]

    def append(self, art_inst=Artwork):
        self.container.append(art_inst)

    def remove_at(self, index):
        self.container.pop(index)

    def pop(self, index):
        return self.container.pop(index)

    def rename(self, new_name):
        self.title = new_name

    # def move(self, index, album_inst):
    #     album_inst.add_artwork(self.container.pop(index))

    @content_show
    def show_album(self):
        return self.container

    def to_dict(self):
        return {"name": self.title, "pics": [item.to_dict() for item in self.container]}
