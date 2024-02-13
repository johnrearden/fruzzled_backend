from . import views
from django.urls import path

urlpatterns = [
    path('', views.BuilderHome.as_view(),
         name='builder_home'),
    path('query/<str:query>/', views.GetMatchingWord.as_view()),
    path('get_definition/<str:query>/', views.GetDefinition.as_view()),
    path('get_grid/', views.GetGrid.as_view(), name='get_grid'),
    path('save_puzzle/', views.SavePuzzle.as_view(), name='save_puzzle'),
    path('get_puzzle/<int:puzzle_id>/', views.GetPuzzle.as_view(), name='get_puzzle'),
    path('get_recent_puzzles/<int:puzzle_count>/',
         views.GetRecentPuzzles.as_view(),
         name='get_recent_puzzles'),
    path('puzzle_editor/<int:puzzle_id>/', views.PuzzleEditor.as_view()),
    path('create_new_puzzle/', views.CreateNewPuzzle.as_view(),
         name='create_new_puzzle'),
    path('delete_puzzle/', views.DeletePuzzle.as_view(), name='delete_puzzle'),
    path('mark_puzzle_reviewed/', views.MarkPuzzleReviewed.as_view(),
         name='mark_puzzle_reviewed'),
    path('mark_puzzle_released/', views.MarkPuzzleReleased.as_view(),
         name='mark_puzzle_released'),
]