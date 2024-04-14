from . import views
from django.urls import path

urlpatterns = [
    path('puzzles/', views.PuzzleList.as_view()),
    path('query/<str:query>/', views.GetMatchingWord.as_view()),
    path('get_definition/<str:query>/', views.GetDefinition.as_view()),
    path('save_puzzle/', views.SavePuzzle.as_view(), name='save_puzzle'),
    path('get_puzzle/<int:puzzle_id>/', views.GetPuzzle.as_view(), name='get_puzzle'),
    path('get_unseen_puzzle/', views.GetUnseenPuzzle.as_view(), name='get_unseen_puzzle'),
    path('create_new_puzzle/', views.CreateNewPuzzle.as_view(),
         name='create_new_puzzle'),
    path('delete_puzzle/<int:id>/', views.DeletePuzzle.as_view(), name='delete_puzzle'),
    path('create_crossword_instance/',
         views.CreateCrosswordInstance.as_view(),
         name='create_crossword_instance')
]