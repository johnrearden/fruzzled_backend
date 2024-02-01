from django.urls import path
from . import views

urlpatterns = [
    path('anagrams/',
          views.AnagramSeriesList.as_view(),
          name='anagram_list'),
    path('get_random_anagram/',
          views.GetRandomAnagram.as_view(),
          name='get_random_anagram'),
]