from django.contrib.sitemaps import Sitemap
from crosswords.models import CrosswordPuzzle


class StaticViewSitemap(Sitemap):
    protocol = 'https'

    _entries = [
        {'location': '/', 'priority': 1.0, 'changefreq': 'weekly'},
        {'location': '/sudoku_home', 'priority': 0.9, 'changefreq': 'weekly'},
        {'location': '/crossword', 'priority': 0.9, 'changefreq': 'weekly'},
        {'location': '/get_puzzle/0', 'priority': 0.8, 'changefreq': 'weekly'},
        {'location': '/get_puzzle/1', 'priority': 0.8, 'changefreq': 'weekly'},
        {'location': '/get_puzzle/2', 'priority': 0.8, 'changefreq': 'weekly'},
        {'location': '/get_puzzle/3', 'priority': 0.8, 'changefreq': 'weekly'},
        {'location': '/stats', 'priority': 0.7, 'changefreq': 'daily'},
        {'location': '/signup', 'priority': 0.6, 'changefreq': 'monthly'},
    ]

    def items(self):
        return self._entries

    def location(self, item):
        return item['location']

    def priority(self, item):
        return item['priority']

    def changefreq(self, item):
        return item['changefreq']

    def lastmod(self, item):
        if item['location'] == '/crossword':
            latest = (
                CrosswordPuzzle.objects
                .filter(released=True)
                .order_by('-last_edited')
                .first()
            )
            if latest:
                return latest.last_edited
        return None


sitemaps = {
    'static': StaticViewSitemap,
}
