from django.http import JsonResponse
from rest_framework import status, generics, permissions, filters
from rest_framework.views import APIView
from datetime import datetime, timedelta

from .models import SudokuPuzzleRequest


class StatsSummary(APIView):
    """
    Class accepts a GET request and returns the number of puzzles
    requested and returned to players across various time boxes
    """

    permission_classes = [permissions.IsAdminUser]

    def get(request):
        now = datetime.now()
        last_day = now - timedelta(days=1)
        today = SudokuPuzzleRequest.objects.filter(created_on__gte=last_day)
        print("Todays count: ", len(today))
        return JsonResponse({'today': len(today)})

