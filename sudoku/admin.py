from django.contrib import admin
from .models import SudokuPuzzle, PuzzleInstance


@admin.register(SudokuPuzzle)
class SudokuPuzzleAdmin(admin.ModelAdmin):
    list_display = ('id', 'grid', 'created_on', 'created_by', 'difficulty',
                    'instances_created', 'instances_completed',)
    list_editable = ('grid', 'difficulty',
                    'instances_created', 'instances_completed',)

    


@admin.register(PuzzleInstance)
class PuzzleInstanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'puzzle', 'owner', 'difficulty', 'grid', 'started_on',
                    'completed', 'completed_at', 'time_taken')
    list_editable = ('puzzle', 'owner', 'grid', 'completed',)

    def difficulty(self, obj):
        return obj.puzzle.get_difficulty_display()