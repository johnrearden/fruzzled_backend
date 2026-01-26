from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.db.models import Count, Min, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.renderers import BrowsableAPIRenderer, HTMLFormRenderer

from fruzzled_backend.permissions import HasPlayerProfileCookie
from .serializers import PlayerProfileSerializer
from .models import PlayerProfile
from sudoku.models import PuzzleInstance
from crosswords.models import CrosswordInstance


class CreatePlayerProfile(APIView):
    http_method_names = ['get', 'post']
    serializer_class = PlayerProfileSerializer

    def post(self, request):
        serializer = PlayerProfileSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            instance = serializer.save()
            response = Response(status=status.HTTP_201_CREATED)
            response.set_cookie(
                key=settings.PLAYER_PROFILE_COOKIE,
                value=instance.uuid,
                secure=True,
                samesite='None',
                )
            response.data = serializer.data
            return response


class RetrievePlayerProfile(APIView):
    permission_classes = [HasPlayerProfileCookie]
    authentication_classes = []

    def get(self, request):
        profile_cookie = request.COOKIES.get(settings.PLAYER_PROFILE_COOKIE, '')
        profile = get_object_or_404(PlayerProfile, uuid=profile_cookie)
        serializer = PlayerProfileSerializer(profile)
        return Response(serializer.data)



class IsNicknameAvailable(APIView):
    http_method_names = ['get']

    def get(self, request):
        query = request.GET['nickname'] if request.GET else None
        if query:
            exists = PlayerProfile.objects.filter(nickname=query).exists()
            boolean_value = 'true' if not exists else 'false'
            response = Response(
                status=status.HTTP_200_OK,
                data={'available': boolean_value}
            )
            return response
        else:
            response = Response(
                status=status.HTTP_200_OK,
                data={'available': 'true'}
            )
            return response


class PlayerStatsView(APIView):
    permission_classes = [HasPlayerProfileCookie]
    authentication_classes = []

    def get(self, request):
        profile_cookie = request.COOKIES.get(settings.PLAYER_PROFILE_COOKIE, '')
        profile = get_object_or_404(PlayerProfile, uuid=profile_cookie)

        # Sudoku stats
        sudoku_instances = PuzzleInstance.objects.filter(owner=profile)
        sudoku_count = sudoku_instances.count()
        sudoku_by_difficulty = sudoku_instances.values(
            'puzzle__difficulty'
        ).annotate(
            count=Count('id'),
            best_time=Min('time_taken'),
            avg_time=Avg('time_taken')
        )

        # Convert difficulty numbers to names and format times
        difficulty_names = {0: 'Easy', 1: 'Medium', 2: 'Hard', 3: 'Vicious'}
        sudoku_stats_by_difficulty = []
        for item in sudoku_by_difficulty:
            sudoku_stats_by_difficulty.append({
                'difficulty': difficulty_names.get(item['puzzle__difficulty'], 'Unknown'),
                'count': item['count'],
                'best_time_ms': int(item['best_time'].total_seconds() * 1000) if item['best_time'] else None,
                'avg_time_ms': int(item['avg_time'].total_seconds() * 1000) if item['avg_time'] else None,
            })

        # Crossword stats
        crossword_instances = CrosswordInstance.objects.filter(owner=profile)
        crossword_count = crossword_instances.count()
        crossword_stats = crossword_instances.aggregate(
            best_time=Min('time_taken'),
            avg_time=Avg('time_taken'),
            avg_accuracy=Avg('percent_correct')
        )

        # Recent activity (last 10 puzzles of any type)
        recent_sudoku = list(sudoku_instances.order_by('-completed_at')[:5].values(
            'id', 'completed_at', 'time_taken', 'puzzle__difficulty'
        ))
        recent_crossword = list(crossword_instances.order_by('-completed_at')[:5].values(
            'id', 'completed_at', 'time_taken', 'percent_correct'
        ))

        # Format recent activity
        recent_activity = []
        for s in recent_sudoku:
            recent_activity.append({
                'type': 'sudoku',
                'id': s['id'],
                'completed_at': s['completed_at'].isoformat() if s['completed_at'] else None,
                'time_ms': int(s['time_taken'].total_seconds() * 1000) if s['time_taken'] else None,
                'difficulty': difficulty_names.get(s['puzzle__difficulty'], 'Unknown'),
            })
        for c in recent_crossword:
            recent_activity.append({
                'type': 'crossword',
                'id': c['id'],
                'completed_at': c['completed_at'].isoformat() if c['completed_at'] else None,
                'time_ms': int(c['time_taken'].total_seconds() * 1000) if c['time_taken'] else None,
                'accuracy': c['percent_correct'],
            })

        # Sort by completion date
        recent_activity.sort(key=lambda x: x['completed_at'] or '', reverse=True)
        recent_activity = recent_activity[:10]

        stats = {
            'profile': {
                'nickname': profile.nickname,
                'country': profile.country,
                'current_streak': profile.current_streak,
                'longest_streak': profile.longest_streak,
                'last_played_date': profile.last_played_date.isoformat() if profile.last_played_date else None,
            },
            'sudoku': {
                'total_completed': sudoku_count,
                'by_difficulty': sudoku_stats_by_difficulty,
            },
            'crossword': {
                'total_completed': crossword_count,
                'best_time_ms': int(crossword_stats['best_time'].total_seconds() * 1000) if crossword_stats['best_time'] else None,
                'avg_time_ms': int(crossword_stats['avg_time'].total_seconds() * 1000) if crossword_stats['avg_time'] else None,
                'avg_accuracy': round(crossword_stats['avg_accuracy'], 1) if crossword_stats['avg_accuracy'] else None,
            },
            'total_puzzles_completed': sudoku_count + crossword_count,
            'recent_activity': recent_activity,
        }

        return Response(stats)