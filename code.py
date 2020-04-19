class Artwork:
    def __init__(self, title='SampleTitle', author_name='SampleAuthor', author_link='Empty', description='No',
                 content=[]):
        self.title = title
        self.author_name = author_name
        self.author_link = author_link
        self.description = description
        self.content = content

    def __str__(self):
        return 'Artwork Title: {};Description: {};Author: {};Author link: {};Content: {}'.format(self.title,
                                                                                                 self.description,
                                                                                                 self.author_name,
                                                                                                 self.author_link,
                                                                                                 str(self.content)
                                                                                                 .strip('[]'))


def content_returner(f):
    def wrapper(*args, **kwargs):
        result = f(*args, **kwargs)
        if result:
            return [str(item) for item in result]
        else:
            return 'Empty album'

    return wrapper


class Album:
    def __init__(self, init_title="No title"):
        self.title = init_title
        self.container = []

    def __len__(self):
        return len(self.container)

    def add_artwork(self, art_inst=Artwork):
        self.container.append(art_inst)

    def remove_at(self, index):
        self.container.pop(index)

    def rename(self, new_name):
        self.title = new_name

    def move(self, index, album_inst):
       album_inst.add_artwork(self.container.pop(index))

    @content_returner
    def show_album(self):
        return self.container


