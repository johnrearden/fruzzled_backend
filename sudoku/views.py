from django.http import Http404, JsonResponse
from django.conf import settings
from rest_framework import status, generics, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response

from random import choice
from .models import SudokuPuzzle, PuzzleInstance
from player_profile.models import PlayerProfile
from usage_stats.models import SudokuPuzzleRequest
from .serializers import SudokuPuzzleSerializer, PuzzleInstanceSerializer
from fruzzled_backend.permissions import IsOwnerOrReadOnly, HasPlayerProfileCookie

from datetime import datetime


class SudokuPuzzlesList(generics.ListCreateAPIView):
    serializer_class = SudokuPuzzleSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = SudokuPuzzle.objects.all()

    filter_backends = [
        filters.OrderingFilter,
        filters.SearchFilter,
    ]

    filterset_fields = [
        'created_by',
        'difficulty',
    ]

    search_fields = [
        'difficulty',
    ]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CreatePuzzleInstance(generics.CreateAPIView):
    serializer_class = PuzzleInstanceSerializer
    permission_classes = [HasPlayerProfileCookie]
    authentication_classes = []

    def perform_create(self, serializer):
        request = self.request
        profile_cookie = request.COOKIES.get(settings.PLAYER_PROFILE_COOKIE,'')
        profile = PlayerProfile.objects.filter(uuid=profile_cookie).first()
        serializer.save(owner=profile)


class GetRandomPuzzle(APIView):
    http_method_names = ['get']

    def get(self, request, difficulty):
        choices = SudokuPuzzle.objects.filter(difficulty=difficulty)
        if choices:
            query = request.GET['used_puzzles'] if request.GET else None
            seen_puzzles = query.split(',') if query else []
            filtered_choices = choices.exclude(id__in=seen_puzzles)

            # Choose a puzzle at random if any unseen puzzles remain, otherwise
            # return the first puzzle in the seen_puzzles list, the least
            # recently seen puzzle.
            if filtered_choices:
                puzzle = choice(filtered_choices)
            elif seen_puzzles:
                puzzle = SudokuPuzzle.objects.get(id=seen_puzzles[0])
            
            serializer = SudokuPuzzleSerializer(
                    puzzle,
                    context={'request': request})
            puzzle.instances_created += 1
            puzzle.save()

            # Record the sudoku puzzle request by the player
            profile_cookie = request.COOKIES.get(settings.PLAYER_PROFILE_COOKIE, None)
            SudokuPuzzleRequest.objects.create(
                puzzle=puzzle,
                difficulty=puzzle.difficulty,
                player_uuid = profile_cookie
            )

            return Response(serializer.data)
        else:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': ('No puzzles at that difficulty level in DB')}
            )


class GetLeaderboard(APIView):
    '''
    A view that returns this instances position in the rankings for its 
    puzzle, the top 5 in the rankings, and the instance itself)
    '''

    def get(self, request, instance_id):
        instance = PuzzleInstance.objects.filter(id=instance_id).first()
        index = PuzzleInstance.objects.filter(time_taken__lt=instance.time_taken).count()
        rankings = PuzzleInstance.objects.order_by('time_taken')[:5]
        
        top_n_serializer = PuzzleInstanceSerializer(
            rankings, many=True
        )
        instance_serializer = PuzzleInstanceSerializer(instance)
        data = {
            'puzzle_instance': instance_serializer.data,
            'ranking': index,
            'top_n': top_n_serializer.data
        }

        return Response(data)