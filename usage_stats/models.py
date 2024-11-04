from django.db import models
from sudoku.models import SudokuPuzzle

class SudokuPuzzleRequest(models.Model):
    """Class represents a sudoku puzzle request by a player"""

    puzzle = models.ForeignKey(SudokuPuzzle, on_delete=models.CASCADE)
    created_on = models.DateTimeField(auto_now_add=True)
    player_uuid = models.CharField(max_length=256, null=True, blank=True)
    difficulty = models.IntegerField(default=0)

    def __str__(self):
        return f'Puzzle {self.puzzle.id} created on {self.created_on}'




