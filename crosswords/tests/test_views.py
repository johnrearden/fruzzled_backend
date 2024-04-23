import json

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.conf import settings
from rest_framework.test import APITestCase

from crosswords.models import (CrosswordPuzzle, CrosswordInstance,
    DictionaryWord, DictionaryDefinition, Grid)


class TestPuzzleListView(APITestCase):

    ROOT_URL = '/api/crossword_builder/'

    fixtures = [
        'users_fixture.json',
        'player_profiles_fixture.json',
        'crosswords_fixture.json',
        ]

    @classmethod
    def setUpTestData(cls):
        cls.ADMIN_USERNAME = 'test_admin'
        cls.ADMIN_PASSWORD = 'top_secret'
        cls.STD_USER = 'joe_soap'
        cls.STD_USER_PASSWORD = 'monkey123'
        cls.admin_user = User.objects.create_superuser(
            username=cls.ADMIN_USERNAME,
            password=cls.ADMIN_PASSWORD,
        )
        cls.standard_user = User.objects.create_user(
            username=cls.STD_USER,
            password=cls.STD_USER_PASSWORD
        )

    def tearDown(self):
        self.client.logout()
        cache.clear()
    
    def test_authenticated_superuser_gets_puzzle_list(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}puzzles/')
        self.assertEqual(response.status_code, 200)

    def test_authenticated_standard_user_doesnt_get_puzzle_list(self):
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}puzzles/')
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_doesnt_get_puzzle_list(self):
        response = self.client.get(f'{self.ROOT_URL}puzzles/')
        self.assertEqual(response.status_code, 403)

    def test_total_count_correct(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        total_count = CrosswordPuzzle.objects.all().count()
        response = self.client.get(f'{self.ROOT_URL}puzzles/')
        self.assertEqual(response.data['total_count'], total_count)

    def test_total_reviewed_released_complete_correct(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        total_count = CrosswordPuzzle.objects.all().count()
        response = self.client.get(f'{self.ROOT_URL}puzzles/')
        response_complete_count = response.data['total_complete']
        response_reviewed_count = response.data['total_reviewed']
        response_released_count = response.data['total_released']
        self.assertEqual(response.data['total_complete'], response_complete_count)
        self.assertEqual(response.data['total_reviewed'], response_reviewed_count)
        self.assertEqual(response.data['total_released'], response_released_count)


class TestGetMatchingWordView(APITestCase):

    ROOT_URL = '/api/crossword_builder/'

    @classmethod
    def setUpTestData(cls):
        cls.ADMIN_USERNAME = 'test_admin'
        cls.ADMIN_PASSWORD = 'top_secret'
        cls.STD_USER = 'joe_soap'
        cls.STD_USER_PASSWORD = 'monkey123'
        cls.admin_user = User.objects.create_superuser(
            username=cls.ADMIN_USERNAME,
            password=cls.ADMIN_PASSWORD,
        )
        cls.standard_user = User.objects.create_user(
            username=cls.STD_USER,
            password=cls.STD_USER_PASSWORD
        )
        cls.example_word_1 = DictionaryWord.objects.create(
            string='behemoth',
            length=8,
            frequency=1
        )

    def tearDown(self):
        self.client.logout()
        cache.clear()

    def test_authenticated_superuser_can_request(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}query/________/')
        self.assertEqual(response.status_code, 200)

    def test_authenticated_standard_user_cant_request(self):
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}query/________/')
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_cant_request(self):
        response = self.client.get(f'{self.ROOT_URL}query/________/')
        self.assertEqual(response.status_code, 403)

    def test_all_wildcards_matches_word(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        query = '_' * 8
        response = self.client.get(f'{self.ROOT_URL}query/{query}/')
        content = json.loads(response.content)
        self.assertEqual(content['results'][0], self.example_word_1.string)

    def test_wildcard_and_character_mix_matches_word(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        query = '__h_m___'
        response = self.client.get(f'{self.ROOT_URL}query/{query}/')
        content = json.loads(response.content)
        self.assertEqual(content['results'][0], self.example_word_1.string)

    def test_wildcard_with_incorrect_length_returns_no_match(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        query = '___'
        response = self.client.get(f'{self.ROOT_URL}query/{query}/')
        content = json.loads(response.content)
        self.assertEqual(len(content['results']), 0)

    def test_query_string_with_illegal_chars_returns_empty_list(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        query = '762"£$%£$'
        response = self.client.get(f'{self.ROOT_URL}query/{query}/')
        content = json.loads(response.content)
        self.assertEqual(len(content['results']), 0)

    def test_query_string_with_capitalized_chars_returns_correct_result(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        query = 'B__emoTH'
        response = self.client.get(f'{self.ROOT_URL}query/{query}/')
        content = json.loads(response.content)
        self.assertEqual(content['results'][0], 'behemoth')


class TestGetDefinitionView(APITestCase):

    ROOT_URL = '/api/crossword_builder/'

    @classmethod
    def setUpTestData(cls):
        cls.ADMIN_USERNAME = 'test_admin'
        cls.ADMIN_PASSWORD = 'top_secret'
        cls.STD_USER = 'joe_soap'
        cls.STD_USER_PASSWORD = 'monkey123'
        cls.admin_user = User.objects.create_superuser(
            username=cls.ADMIN_USERNAME,
            password=cls.ADMIN_PASSWORD,
        )
        cls.standard_user = User.objects.create_user(
            username=cls.STD_USER,
            password=cls.STD_USER_PASSWORD
        )
        cls.example_word_1 = DictionaryWord.objects.create(
            string='behemoth',
            length=8,
            frequency=1
        )
        cls.example_definition = DictionaryDefinition.objects.create(
            word=cls.example_word_1,
            definition='a large yoke'
        )

    def tearDown(self):
        self.client.logout()
        cache.clear()

    def test_authenticated_superuser_can_request(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_definition/asdf/')
        self.assertEqual(response.status_code, 200)

    def test_authenticated_standard_user_cant_request(self):
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_definition/asdf/')
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_cant_request(self):
        response = self.client.get(f'{self.ROOT_URL}get_definition/asdf/')
        self.assertEqual(response.status_code, 403)

    def test_query_looks_up_correct_definition(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_definition/behemoth/')
        response_string = json.loads(response.content)
        self.assertEqual(response_string['results'][0], self.example_definition.definition)

    def test_query_works_correctly_with_mixed_case_query(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_definition/behEMoth/')
        response_string = json.loads(response.content)
        self.assertEqual(response_string['results'][0], self.example_definition.definition)

    def test_query_returns_empty_list_with_non_dictionary_query(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_definition/oaweuoriuwer/')
        response_string = json.loads(response.content)
        self.assertEqual(len(response_string['results']), 0)


class TestDeletePuzzleView(APITestCase):

    ROOT_URL = '/api/crossword_builder/'

    @classmethod
    def setUpTestData(cls):
        cls.ADMIN_USERNAME = 'test_admin'
        cls.ADMIN_PASSWORD = 'top_secret'
        cls.STD_USER = 'joe_soap'
        cls.STD_USER_PASSWORD = 'monkey123'
        cls.admin_user = User.objects.create_superuser(
            username=cls.ADMIN_USERNAME,
            password=cls.ADMIN_PASSWORD,
        )
        cls.standard_user = User.objects.create_user(
            username=cls.STD_USER,
            password=cls.STD_USER_PASSWORD
        )
        cls.test_grid = Grid.objects.create(
            creator=cls.admin_user,
            width=3,
            height=3,
            cells='---------'
        )
        cls.test_puzzle = CrosswordPuzzle.objects.create(
            grid=cls.test_grid,
            creator=cls.admin_user,
            puzzle_type='CSWD',
        )

    def tearDown(self):
        self.client.logout()
        cache.clear()

    def test_authenticated_superuser_can_delete_test_puzzle(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.delete(
            f'{self.ROOT_URL}delete_puzzle/{self.test_puzzle.id}/')
        self.assertEqual(response.status_code, 200)

    def test_authenticated_standard_user_cant_delete_test_puzzle(self):
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.delete(
            f'{self.ROOT_URL}delete_puzzle/{self.test_puzzle.id}/')
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_cant_delete_test_puzzle(self):
        response = self.client.delete(
            f'{self.ROOT_URL}delete_puzzle/{self.test_puzzle.id}/')
        self.assertEqual(response.status_code, 403)
    

class TestSavePuzzleView(APITestCase):

    ROOT_URL = '/api/crossword_builder/'

    def tearDown(self):
        self.client.logout()
        cache.clear()

    @classmethod
    def setUpTestData(cls):
        cls.ADMIN_USERNAME = 'test_admin'
        cls.ADMIN_PASSWORD = 'top_secret'
        cls.STD_USER = 'joe_soap'
        cls.STD_USER_PASSWORD = 'monkey123'
        cls.admin_user = User.objects.create_superuser(
            username=cls.ADMIN_USERNAME,
            password=cls.ADMIN_PASSWORD,
        )
        cls.standard_user = User.objects.create_user(
            username=cls.STD_USER,
            password=cls.STD_USER_PASSWORD
        )
        cls.grid_string = '###############-#-#-#-#-#-#-###############-#-#-#-#-#-#-###############-#-#-#-#-#-#-###############-#-#-#-#-#-#-###############-#-#-#-#-#-#-###############-#-#-#-#-#-#-###############-#-#-#-#-#-#-'
        cls.grid = Grid.objects.create(
            creator=cls.admin_user,
            width=14,
            height=14,
            cells=cls.grid_string
        )
        cls.test_puzzle = CrosswordPuzzle.objects.create(
            grid=cls.grid,
            creator=cls.admin_user,
            puzzle_type="CSWD",
        )
        cls.clue_string = '[{"solution":"##############","clue":"No clue yet","clue_number":1,"orientation":"AC","start_row":0,"start_col":0,"word_lengths":"(14)"}]'
        
        cls.request_data = {
            'puzzle_id': cls.test_puzzle.id,
            'clues': cls.clue_string,
            'grid': cls.grid_string,
            'complete': 'false',
            'reviewed': 'false',
            'released': 'false'
        }

    def test_authenticated_superuser_can_save_puzzle(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.post(
            f'{self.ROOT_URL}save_puzzle/',
            self.request_data
        )
        self.assertEqual(response.status_code, 200)

    def test_authenticated_ordinary_user_cannot_save_puzzle(self):
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.post(
            f'{self.ROOT_URL}save_puzzle/',
            self.request_data
        )
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_cannot_save_puzzle(self):
        response = self.client.post(
            f'{self.ROOT_URL}save_puzzle/',
            self.request_data
        )
        self.assertEqual(response.status_code, 403)

    def test_puzzle_not_saved_as_complete_if_blank_cell_remains(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        id = self.test_puzzle.id
        self.request_data['clues'] = self.request_data['clues'] \
                                         .replace('No clue yet', 'non-default value')
        response = self.client.post(
            f'{self.ROOT_URL}save_puzzle/',
            self.request_data
        )
        self.assertEqual(response.status_code, 200)
        saved_puzzle = get_object_or_404(CrosswordPuzzle, pk=id)
        self.assertFalse(saved_puzzle.complete)

    def test_puzzle_not_saved_as_complete_if_any_clue_is_no_clue_yet(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        id = self.test_puzzle.id

        # Ensure that the empty grid cells do not prevent 'complete' flag being set.
        self.request_data['grid'] = self.request_data['grid'].replace('#', 'p')
        response = self.client.post(
            f'{self.ROOT_URL}save_puzzle/',
            self.request_data
        )
        self.assertEqual(response.status_code, 200)
        saved_puzzle = get_object_or_404(CrosswordPuzzle, pk=id)
        self.assertFalse(saved_puzzle.complete)


class TestCreateNewPuzzleView(APITestCase):

    ROOT_URL = '/api/crossword_builder/'

    def tearDown(self):
        self.client.logout()
        cache.clear()

    @classmethod
    def setUpTestData(cls):
        cls.ADMIN_USERNAME = 'test_admin'
        cls.ADMIN_PASSWORD = 'top_secret'
        cls.STD_USER = 'joe_soap'
        cls.STD_USER_PASSWORD = 'monkey123'
        cls.admin_user = User.objects.create_superuser(
            username=cls.ADMIN_USERNAME,
            password=cls.ADMIN_PASSWORD,
        )
        cls.standard_user = User.objects.create_user(
            username=cls.STD_USER,
            password=cls.STD_USER_PASSWORD
        )
        cls.grid_string = '#-#-'
        cls.width = 2
        cls.height = 2
        cls.puzzle_type = 'CROSSWORD'

    def test_authenticated_admin_user_can_create_puzzle(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.post(
            self.ROOT_URL + 'create_new_puzzle/',
            {
                'puzzle_type': 'CROSSWORD',
                'width': self.width,
                'height': self.height,
                'cells': self.grid_string,
            }
        )
        self.assertEqual(response.status_code, 200)

    def test_authenticated_ordinary_user_cannot_create_puzzle(self):
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.post(
            self.ROOT_URL + 'create_new_puzzle/',
            {
                'puzzle_type': 'CROSSWORD',
                'width': self.width,
                'height': self.height,
                'cells': self.grid_string,
            }
        )
        self.assertEqual(response.status_code, 403)

    def test_anonymous_user_cannot_create_puzzle(self):
        response = self.client.post(
            self.ROOT_URL + 'create_new_puzzle/',
            {
                'puzzle_type': 'CROSSWORD',
                'width': self.width,
                'height': self.height,
                'cells': self.grid_string,
            }
        )
        self.assertEqual(response.status_code, 403)

    def test_puzzle_not_created_with_non_matching_cell_string_length(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.post(
            self.ROOT_URL + 'create_new_puzzle/',
            {
                'puzzle_type': 'CROSSWORD',
                'width': self.width,
                'height': self.height,
                'cells': '#',
            }
        )
        self.assertEqual(response.status_code, 400)

    def test_puzzle_not_created_with_non_integer_width_or_height(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.post(
            self.ROOT_URL + 'create_new_puzzle/',
            {
                'puzzle_type': 'CROSSWORD',
                'width': 'p',
                'height': self.height,
                'cells': '####',
            }
        )
        self.assertEqual(response.status_code, 400)


class TestGetPuzzleView(APITestCase):

    ROOT_URL = '/api/crossword_builder/'

    def tearDown(self):
        self.client.logout()
        cache.clear()

    @classmethod
    def setUpTestData(cls):
        cls.ADMIN_USERNAME = 'test_admin'
        cls.ADMIN_PASSWORD = 'top_secret'
        cls.STD_USER = 'joe_soap'
        cls.STD_USER_PASSWORD = 'monkey123'
        cls.admin_user = User.objects.create_superuser(
            username=cls.ADMIN_USERNAME,
            password=cls.ADMIN_PASSWORD,
        )
        cls.standard_user = User.objects.create_user(
            username=cls.STD_USER,
            password=cls.STD_USER_PASSWORD
        )
        cls.grid_string = '####'
        cls.grid = Grid.objects.create(
            creator=cls.admin_user,
            width=2,
            height=2,
            cells=cls.grid_string
        )
        cls.test_puzzle = CrosswordPuzzle.objects.create(
            grid=cls.grid,
            creator=cls.admin_user,
            puzzle_type="CSWD",
        )

    def test_authenticated_admin_user_can_get_puzzle(self):
        id = self.test_puzzle.pk
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_puzzle/{id}/')
        self.assertEqual(response.status_code, 200)

    def test_authenticated_standard_user_cannot_get_puzzle(self):
        id = self.test_puzzle.pk
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_puzzle/{id}/')
        self.assertEqual(response.status_code, 403)

    def test_anonymous_user_cannot_get_puzzle(self):
        id = self.test_puzzle.pk
        response = self.client.get(f'{self.ROOT_URL}get_puzzle/{id}/')
        self.assertEqual(response.status_code, 403)

    def test_request_for_nonexistent_puzzle_returns_404(self):
        id = 99999
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_puzzle/{id}/')
        self.assertEqual(response.status_code, 404)


class TestGetUnseenPuzzleView(APITestCase):
    ROOT_URL = '/api/crossword_builder/'

    def tearDown(self):
        self.client.logout()
        cache.clear()

    @classmethod
    def setUpTestData(cls):
        cls.ADMIN_USERNAME = 'test_admin'
        cls.ADMIN_PASSWORD = 'top_secret'
        cls.STD_USER = 'joe_soap'
        cls.STD_USER_PASSWORD = 'monkey123'
        cls.admin_user = User.objects.create_superuser(
            username=cls.ADMIN_USERNAME,
            password=cls.ADMIN_PASSWORD,
        )
        cls.standard_user = User.objects.create_user(
            username=cls.STD_USER,
            password=cls.STD_USER_PASSWORD
        )
        cls.grid_string = '####'
        cls.grid_1 = Grid.objects.create(
            creator=cls.admin_user,
            width=2,
            height=2,
            cells=cls.grid_string
        )
        cls.grid_2 = Grid.objects.create(
            creator=cls.admin_user,
            width=2,
            height=2,
            cells=cls.grid_string
        )
        cls.test_puzzle_1 = CrosswordPuzzle.objects.create(
            grid=cls.grid_1,
            creator=cls.admin_user,
            puzzle_type="CSWD",
            released=True
        )
        cls.test_puzzle_2 = CrosswordPuzzle.objects.create(
            grid=cls.grid_2,
            creator=cls.admin_user,
            puzzle_type="CSWD",
            released=True
        )

    def test_anonymous_user_can_get_puzzle(self):
        response = self.client.get(f'{self.ROOT_URL}get_unseen_puzzle/')
        self.assertEqual(response.status_code, 200)

    def test_request_with_seen_puzzle_id_does_not_return_that_puzzle_if_other_exists(self):
        id_1 = self.test_puzzle_1.pk
        id_2 = self.test_puzzle_2.pk
        url = f'{self.ROOT_URL}get_unseen_puzzle/?seen_crosswords={id_1}'
        response = self.client.get(url)
        response_puzzle_id = response.data['puzzle']['puzzle']['id']
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_puzzle_id, id_2)

    def test_request_with_seen_puzzle_ids_returns_first_puzzle_in_seen_crosswords_if_all_are_seen(self):
        id_1 = self.test_puzzle_1.pk
        id_2 = self.test_puzzle_2.pk
        url = f'{self.ROOT_URL}get_unseen_puzzle/?seen_crosswords={id_2},{id_1}'
        response = self.client.get(url)
        response_puzzle_id = response.data['puzzle']['puzzle']['id']
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_puzzle_id, id_2)

    def test_anonymous_user_requests_are_throttled_correctly(self):
        id_1 = self.test_puzzle_1.pk
        id_2 = self.test_puzzle_2.pk
        url = f'{self.ROOT_URL}get_unseen_puzzle/?seen_crosswords={id_2},{id_1}'
        ANON_THROTTLE_RATE = settings.ANONYMOUS_USER_THROTTLE_RATE
        for _ in range(ANON_THROTTLE_RATE + 1):
            response = self.client.get(url)
        self.assertEqual(response.status_code, 429)


