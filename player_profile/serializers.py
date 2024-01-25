from rest_framework import serializers
from .models import PlayerProfile


class PlayerProfileSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PlayerProfile
        fields = ['id', 'nickname', 'country']