from rest_framework import serializers
from .models import SudokuPuzzle, PuzzleInstance
from player_profile.models import PlayerProfile
from datetime import datetime


class SudokuPuzzleSerializer(serializers.ModelSerializer):
    creator = serializers.ReadOnlyField(source='created_by.username')
    is_owner = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()

    def get_is_owner(self, obj):
        request = self.context['request']
        return request.user == obj.created_by

    def get_start_time(self, obj):
        return datetime.now()

    class Meta:
        model = SudokuPuzzle
        fields = ['id', 'grid', 'created_on', 'difficulty',
                  'instances_created', 'instances_completed', 'creator',
                  'is_owner', 'start_time']


class PuzzleInstanceSerializer(serializers.ModelSerializer):

    original = serializers.ReadOnlyField(source='puzzle.grid')
    difficulty = serializers.ReadOnlyField(source='puzzle.get_difficulty_display')
    owner_nickname = serializers.ReadOnlyField(source='owner.nickname')
    owner_country = serializers.ReadOnlyField(source="owner.country")

    duration = serializers.SerializerMethodField()
    def get_duration(self, obj):
        print(f'Time taken : {int(obj.time_taken.total_seconds() * 1000)}')
        return int(obj.time_taken.total_seconds() * 1000)

    class Meta:
        model = PuzzleInstance
        fields = ['id', 'puzzle', 'owner', 'owner_nickname', 'owner_country', 
                  'grid', 'original', 'started_on', 'completed', 'difficulty',
                  'completed_at', 'time_taken', 'duration']