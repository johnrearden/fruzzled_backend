from django.shortcuts import render, get_object_or_404
from django.db.models import Count
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.mixins import UserPassesTestMixin
from .models import DictionaryWord, DictionaryDefinition, Grid
from .models import CrosswordPuzzle, CrosswordClue, PuzzleType
from player_profile.models import PlayerProfile
from .serializers import GridSerializer, CrosswordPuzzleSerializer, \
                         CrosswordClueSerializer, CrosswordInstanceSerializer
from fruzzled_backend.permissions import HasPlayerProfileCookie
from .utils import get_cell_concentration
from django_filters.rest_framework import DjangoFilterBackend
from random import choice
import json


class PuzzleList(generics.ListCreateAPIView):
    """
    Returns a response with all crossword puzzles matching the filter
    criteria, plus a summary of the total number of puzzles (unfiltered)
    and the total number that match each filter criterion

    Authenticated superusers only
    """
    queryset = CrosswordPuzzle.objects.all().order_by('-created_on')
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CrosswordPuzzleSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['complete', 'reviewed', 'released',]

    def list(self, request, *args, **kwargs):
        response = super().list(request, args, kwargs)
        total = CrosswordPuzzle.objects.count()
        total_complete = CrosswordPuzzle.objects.filter(complete=True).count()
        total_reviewed = CrosswordPuzzle.objects.filter(reviewed=True).count()
        total_released = CrosswordPuzzle.objects.filter(released=True).count()
        response.data['total_count'] = total
        response.data['total_complete'] = total_complete
        response.data['total_reviewed'] = total_reviewed
        response.data['total_released'] = total_released
        return response


class GetMatchingWord(APIView):
    """
    Returns a response with a list of word matching the query string in length.
    The request supplies a query string with a mix of letters and '_' wildcard
    characters, and the response list consists of all DictionaryWord instances
    that match that definition.

    Authenticated superusers only
    """

    permission_classes = [permissions.IsAdminUser]

    def get(self, request, query):
        query = query.lower()
        known_chars = []
        for i, char in enumerate(query):
            if char != '_':
                known_chars.append((i, char))
        length = len(query)
        result_list = []
        full_list = DictionaryWord.objects.filter(length=length) \
            .order_by('frequency')
        for candidate in full_list:
            match = True
            for tup in known_chars:
                index = tup[0]
                char = tup[1]
                if candidate.string[index] != char:
                    match = False
                    break
            if match:
                result_list.append(candidate)
        result_list.sort(key=DictionaryWord.get_frequency, reverse=True)
        words = [d_word.string for d_word in result_list]

        return JsonResponse({'results': words})


class GetDefinition(APIView):
    """
    Takes a query string representing a word, and returns a JsonResponse
    containing all the definitions that match the string in the database

    Authenticated superusers only
    """

    permission_classes = [permissions.IsAdminUser]

    def get(self, request, query):
        words = DictionaryWord.objects.filter(string=query.lower())
        def_list = []
        for word in words:
            definitions = DictionaryDefinition.objects.filter(word=word)
            for defn in definitions:
                def_list.append(defn.definition)
        return JsonResponse({'results': def_list})


class DeletePuzzle(APIView):

    permission_classes = [permissions.IsAdminUser]

    def delete(self, request):
        id = request.data['puzzle_id']
        CrosswordPuzzle.objects.get(pk=id).delete()
        return JsonResponse({'message': 'fine'})


class SavePuzzle(APIView):
    """
    Saves an existing puzzle
    """

    permission_classes = [permissions.IsAdminUser]

    def post(self, request, *args, **kwargs):
        allow_complete = True
        clues_data = json.loads(request.data['clues'])

        if request.data['puzzle_id']:

            # Update the puzzle grid's cells field
            id = int(request.data['puzzle_id'])
            puzzle = get_object_or_404(CrosswordPuzzle, pk=id)
            grid_data = request.data['grid']
            puzzle.grid.cells = grid_data
            puzzle.grid.save()

            # Remove any clues previously associated with this puzzle.
            CrosswordClue.objects.filter(puzzle=puzzle).delete()

        else:
            grid_data = request.data['grid']

            # Create a grid
            grid = Grid.objects.create(
                creator=request.user,
                width=grid_data['width'],
                height=grid_data['height'],
                cells=grid_data['grid_string'],
            )

            # Create a puzzle
            puzzle = CrosswordPuzzle.objects.create(
                grid=grid,
                creator=request.user,
                commit=False,
            )

        # In both cases, we need to create new clues from the api call data
        puzzle_complete = True
        for item in clues_data:
            new_clue = CrosswordClue.objects.create(
                puzzle=puzzle,
                creator=request.user,
                clue=item['clue'],
                clue_number=item['clue_number'],
                solution=item['solution'],
                word_lengths=item['word_lengths'],
                orientation=item['orientation'],
                start_row=item['start_row'],
                start_col=item['start_col'],
            )
            if len(new_clue.clue) == 0 or '#' in new_clue.solution:
                allow_complete = False
            

        # Save the crossword puzzle
        if request.POST['complete']:
            puzzle.complete = allow_complete and request.POST['complete'] == 'true'
        if request.POST['reviewed']:
            puzzle.reviewed = request.POST['reviewed'] == 'true'
        if request.POST['released']:
            puzzle.released = request.POST['released'] == 'true'
        puzzle.save()

        return JsonResponse({'puzzle_id': puzzle.id})


class CreateNewPuzzle(APIView):

    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        if request.data['puzzle_type'] == 'CROSSWORD':
            puzzle_type = PuzzleType.CROSSWORD
        else:
            puzzle_type = PuzzleType.CRANAGRAM
        grid = Grid.objects.create(
            creator=request.user,
            width=request.data['width'],
            height=request.data['height'],
            cells=request.data['cells'],
        )
        puzzle = CrosswordPuzzle.objects.create(
            creator=request.user,
            grid=grid,
            puzzle_type=puzzle_type,
        )

        return JsonResponse({'new_puzzle_id': puzzle.id})


class GetPuzzle(APIView):
    def get(self, request, puzzle_id):
        puzzle = get_object_or_404(CrosswordPuzzle, pk=puzzle_id)
        cell_concentration = get_cell_concentration(puzzle)

        # Retrieve the clues for this crossword, and count the
        # number of them that have a non-empty clue string. Also count the
        # number of them that have a complete solution
        clues = CrosswordClue.objects.filter(puzzle=puzzle)
        if not clues:
            clue_count = 0
            solution_count = 0
        else:
            clue_count = 0
            solution_count = 0
            for clue in clues:
                if len(clue.clue) > 0:
                    clue_count += 1
                if '#' not in clue.solution:
                    solution_count += 1
        puzzle_serializer = CrosswordPuzzleSerializer(puzzle)
        clue_serialzer = CrosswordClueSerializer(clues, many=True)
        data = {
            'puzzle': puzzle_serializer.data,
            'clues': clue_serialzer.data,
            'cell_concentration': cell_concentration,
            'clues_present': clue_count,
            'solutions_present': solution_count,
            'total_clues': len(clues)
        }
        return Response({'puzzle': data})


class GetUnseenPuzzle(APIView):

    def get(self, request):
        puzzles = CrosswordPuzzle.objects.filter(released=True)
        if puzzles:
            query = request.GET['seen_crosswords'] if request.GET else None
            seen_crosswords = query.split(',') if query else []
            choices = puzzles.exclude(id__in=seen_crosswords)

            if choices:
                crossword = choice(choices)
            elif seen_crosswords:
                crossword = puzzles.filter(id=seen_crosswords[0]).first()
            else:
                crossword = choice(puzzles)
            
            puzzle_serializer = CrosswordPuzzleSerializer(crossword)
            clues = CrosswordClue.objects.filter(puzzle=crossword)
            if not clues:
                clue_count = 0
                solution_count = 0
            else:
                clue_count = 0
                solution_count = 0
                for clue in clues:
                    if len(clue.clue) > 0:
                        clue_count += 1
                    if '#' not in clue.solution:
                        solution_count += 1
            clue_serialzer = CrosswordClueSerializer(clues, many=True)
            
            data = {
                'puzzle': puzzle_serializer.data,
                'clues': clue_serialzer.data,
                'cell_concentration': get_cell_concentration(crossword),
                'clues_present': clue_count,
                'solutions_present': solution_count,
                'total_clues': len(clues)
            }
            return Response({'puzzle': data})
        else:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': ('No puzzles found')}
            )


class CreateCrosswordInstance(generics.CreateAPIView):
    serializer_class = CrosswordInstanceSerializer
    permissions_classes = [HasPlayerProfileCookie]
    authentication_classes = []

    def perform_create(self, serializer):
        request = self.request
        profile_cookie = request.COOKIES.get(settings.PLAYER_PROFILE_COOKIE,'')
        profile = PlayerProfile.objects.filter(uuid=profile_cookie).first()
        serializer.save(owner=profile)


