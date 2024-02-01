from django.db import models
from django.contrib.auth.models import User


class AnagramSeries(models.Model):
    difficulty = models.IntegerField(default=0)
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='anagram_series')
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Anagram series (difficulty {self.difficulty} by {self.creator.username})'


class Anagram(models.Model):
    word = models.CharField(max_length=20)
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='anagram')
    created_on = models.DateTimeField(auto_now_add=True)
    series = models.ForeignKey(
        AnagramSeries, on_delete=models.CASCADE, related_name='anagrams'
    )

    def __str__(self):
        return f'{self.word} from series {self.series.id}'
