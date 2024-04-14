import json

from django.test import TestCase
from django.contrib.auth.models import User

from crosswords.models import (CrosswordPuzzle, CrosswordInstance,
    DictionaryWord, DictionaryDefinition, Grid)


class TestPuzzleListView(TestCase):

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


class TestGetMatchingWordView(TestCase):

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


class TestGetDefinitionView(TestCase):

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
            word = cls.example_word_1,
            definition = 'a large yoke'
        )

    def tearDown(self):
        self.client.logout()

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


class TestDeletePuzzleView(TestCase):

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

    def test_authenticated_superuser_can_delete_test_puzzle(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.delete(
            f'{self.ROOT_URL}delete_puzzle/',
            {'puzzle_id': self.test_puzzle.id})
        self.assertEqual(response.status_code, 200)

    def test_authenticated_standard_user_cant_delete_test_puzzle(self):
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.post(
            f'{self.ROOT_URL}delete_puzzle/',
            {'puzzle_id': self.test_puzzle.id})
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_cant_delete_test_puzzle(self):
        response = self.client.post(
            f'{self.ROOT_URL}delete_puzzle/',
            {'puzzle_id': self.test_puzzle.id})
        self.assertEqual(response.status_code, 403)
    




