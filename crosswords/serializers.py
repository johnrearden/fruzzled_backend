from rest_framework import serializers
from .models import CrosswordClue, CrosswordPuzzle, Grid, CrosswordInstance
from datetime import datetime


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

    start_time = serializers.SerializerMethodField()
    def get_start_time(self, obj):
        return datetime.now()

    class Meta:
        model = CrosswordPuzzle
        fields = ['id', 'created_on', 'creator', 'clues', 'last_edited', 
                  'puzzle_type', 'grid', 'complete', 'reviewed', 'released',
                  'start_time']


class CrosswordInstanceSerializer(serializers.ModelSerializer):

    owner_nickname = serializers.ReadOnlyField(source='owner.nickname')
    owner_country = serializers.ReadOnlyField(source='owner.country')

    duration = serializers.SerializerMethodField()
    def get_duration(self, obj):
        return int(obj.time_taken.total_seconds() * 1000)

    class Meta:
        model = CrosswordInstance
        fields = ['id', 'crossword_puzzle', 'owner', 'started_on',
                  'completed_at', 'time_taken', 'percent_complete',
                  'percent_correct', 'owner_nickname', 'owner_country',
                  'duration']