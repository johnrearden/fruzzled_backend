from rest_framework import serializers
from .models import CrosswordClue, CrosswordPuzzle, Grid


class GridSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grid
        fields = ['width', 'height', 'cells']


class CrosswordClueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrosswordClue
        fields = ['id', 'clue', 'solution', 'word_lengths', 'orientation',
                  'start_col', 'start_row', 'clue_number']


class CrosswordPuzzleSerializer(serializers.ModelSerializer):

    grid = GridSerializer()
    clues = CrosswordClueSerializer(many=True, read_only=True)

    class Meta:
        model = CrosswordPuzzle
        fields = ['id', 'created_on', 'creator', 'clues', 'last_edited', 
                  'puzzle_type', 'grid', 'complete', 'reviewed', 'released']