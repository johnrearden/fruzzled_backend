from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from django.http import JsonResponse
from .models import DictionaryWord, DictionaryDefinition, Grid
from .models import CrosswordPuzzle, CrosswordClue, PuzzleType
from player_profile.models import PlayerProfile
from usage_stats.models import CrosswordPuzzleRequest
from .serializers import CrosswordPuzzleSerializer, \
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

    """
    Handles a HTTP delete request, including an integer id parameter,
    and deletes the corresponding CrosswordPuzzle

    Authenticated superusers only
    """

    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, id):
        puzzle = CrosswordPuzzle.objects.get(pk=id)
        if not puzzle.complete:
            puzzle.delete()
            return JsonResponse({'message': 'fine'})
        else:
            return JsonResponse(
                {'message': 'Cannot delete completed crossword!'},
                status=405,
            )


class SavePuzzle(APIView):
    """
    Saves an existing puzzle. This operation is destructive - any previous 
    clues associated with this puzzle are deleted before the clues included 
    in the POST request are added. For an existing puzzle, the grid field can
    be changed (cells can be opened/closed) but the original dimensions of 
    the grid are preserved.

    The list of clues is included in the request as a JSON-encoded string.

    The complete flag on the crossword will be set to False irrespective of the
    request value, if any cell is still blank or if any clue has a string
    of length 0. This a QA sanity check to avoid defective puzzles from making
    it to review and release stage.

    Authenticated superusers only
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
            if (len(new_clue.clue) == 0 
                or new_clue.clue.lower() == 'no clue yet'
                    or '#' in new_clue.solution):
                allow_complete = False

        # Save the crossword puzzle
        if request.POST['complete']:
            post_complete_flag = request.POST['complete'] == 'true'
            puzzle.complete = allow_complete and post_complete_flag
        if request.POST['reviewed']:
            puzzle.reviewed = request.POST['reviewed'] == 'true'
        if request.POST['released']:
            puzzle.released = request.POST['released'] == 'true'
        puzzle.save()

        return JsonResponse({'puzzle_id': puzzle.id})


class CreateNewPuzzle(APIView):

    """
    Creates a new Crossword or Crannagram puzzle (same model). The request
    should contain a width, height, cell string and the puzzle type, 
    CROSSWORD or CRANNAGRAM.

    The view performs a validation check to ensure that the width multiplied by
    the height equals the length of the cell string, and also checks that
    the width and height can be parsed as ints.
    """

    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        if request.data['puzzle_type'] == 'CROSSWORD':
            puzzle_type = PuzzleType.CROSSWORD
        else:
            puzzle_type = PuzzleType.CRANAGRAM

        try:
            width = int(request.data['width'])
            height = int(request.data['height'])
        except ValueError:
            return JsonResponse(
                {'message': 'width and height should be integers'},
                status=400
            )
        
        cells = request.data['cells']

        if width * height != len(cells):
            return JsonResponse(
                {'message': 'len(cells) does not match width * height'},
                status=400
            )
        
        grid = Grid.objects.create(
            creator=request.user,
            width=width,
            height=height,
            cells=cells,
        )
        puzzle = CrosswordPuzzle.objects.create(
            creator=request.user,
            grid=grid,
            puzzle_type=puzzle_type,
        )

        return JsonResponse({'new_puzzle_id': puzzle.id})


class GetPuzzle(APIView):

    permission_classes = [permissions.IsAdminUser]

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

    throttle_scope = 'get_unseen_puzzle'

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

            # Record the crossword puzzle request by the player
            profile_cookie = request.COOKIES.get(settings.PLAYER_PROFILE_COOKIE, None)
            CrosswordPuzzleRequest.objects.create(
                puzzle=crossword,
                player_uuid = profile_cookie
            )
            
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
        profile_cookie = request.COOKIES.get(
            settings.PLAYER_PROFILE_COOKIE, '')
        profile = PlayerProfile.objects.filter(uuid=profile_cookie).first()
        serializer.save(owner=profile)


