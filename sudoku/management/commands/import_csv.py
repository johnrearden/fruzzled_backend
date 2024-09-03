import csv
from sudoku.models import SudokuPuzzle
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Import csv puzzle data and create sudoku model instances'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='csv file to import')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        creator = User.objects.get(username='admin')
        puzzles_created = 0

        with open(csv_file) as infile:
            csv_reader = csv.reader(infile, delimiter=',')
            for row in csv_reader:
                SudokuPuzzle.objects.create(
                    grid=row[1],
                    created_by=creator,
                    difficulty=3
                )
                puzzles_created += 1
                print(f'puzzles created : {puzzles_created}\r', end='')
