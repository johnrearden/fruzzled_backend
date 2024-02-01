from rest_framework import serializers
from .models import Anagram, AnagramSeries


class AnagramSerializer(serializers.ModelSerializer):

    creator_id = serializers.ReadOnlyField(source='creator.pk')
    creator = serializers.ReadOnlyField(source='creator.username')

    class Meta:
        model = Anagram
        fields = ['word', 'creator_id', 'creator', 'created_on', 'series_id']


class AnagramSeriesSerializer(serializers.ModelSerializer):

    anagrams = AnagramSerializer(many=True)

    creator_id = serializers.ReadOnlyField(source='creator.pk')
    creator = serializers.ReadOnlyField(source='creator.username')

    class Meta:
        model = AnagramSeries
        fields = ['difficulty', 'creator', 'creator_id', 'created_on', 'anagrams']