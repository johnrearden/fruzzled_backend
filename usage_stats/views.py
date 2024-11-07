from django.http import JsonResponse
from rest_framework import status, generics, permissions, filters
from rest_framework.views import APIView
from datetime import datetime, timedelta
from django.utils import timezone

from .models import SudokuPuzzleRequest, CrosswordPuzzleRequest


class StatsSummary(APIView):
    """
    Class accepts a GET request and returns the number of puzzles
    requested and returned to players across various time boxes
    """

    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        one_day_cutoff = now - timedelta(days=1)
        last_week_cutoff = now - timedelta(days=7)
        last_4_weeks_cutoff = now - timedelta(days=28)
        one_hour_cutoff = now - timedelta(hours=1)

        # Retrieve the first queryset and then filter it to produce
        # each subset in turn
        sudoku_all_time = SudokuPuzzleRequest.objects.all()
        sudoku_last_4_weeks = sudoku_all_time.filter(created_on__gte=last_4_weeks_cutoff)
        sudoku_last_week = sudoku_last_4_weeks.filter(created_on__gte=last_week_cutoff)
        sudoku_last_day = sudoku_last_week.filter(created_on__gte=one_day_cutoff)
        sudoku_last_hour = sudoku_last_day.filter(created_on__gte=one_hour_cutoff)

        crossword_all_time = CrosswordPuzzleRequest.objects.all()
        crossword_last_4_weeks = crossword_all_time.filter(created_on__gte=last_4_weeks_cutoff)
        crossword_last_week = crossword_last_4_weeks.filter(created_on__gte=last_week_cutoff)
        crossword_last_day = crossword_last_week.filter(created_on__gte=one_day_cutoff)
        crossword_last_hour = crossword_last_day.filter(created_on__gte=one_hour_cutoff)
        
        return JsonResponse({
            'sudoku_last_hour_count': len(sudoku_last_hour),
            'sudoku_today_count': len(sudoku_last_day),
            'sudoku_last_week_count': len(sudoku_last_week),
            'sudoku_last_4_weeks_count': len(sudoku_last_4_weeks),
            'sudoku_all_time_count': len(sudoku_all_time),
            'crossword_last_hour_count': len(crossword_last_hour),
            'crossword_today_count': len(crossword_last_day),
            'crossword_last_week_count': len(crossword_last_week),
            'crossword_last_4_weeks_count': len(crossword_last_4_weeks),
            'crossword_all_time_count': len(crossword_all_time),
        })