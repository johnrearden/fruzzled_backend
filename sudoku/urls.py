from django.urls import path
from . import views

urlpatterns = [
    path('sudoku_puzzles/', views.SudokuPuzzlesList.as_view()),
    path('get_random_puzzle/<int:difficulty>/',
         views.GetRandomPuzzle.as_view()),
    path('create_puzzle_instance/',
          views.CreatePuzzleInstance.as_view()),
    path('get_leaderboard/<int:instance_id>/',
          views.GetLeaderboard.as_view()),
]