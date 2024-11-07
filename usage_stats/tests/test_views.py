from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from django.core.cache import cache


class TestStatsSummaryView(APITestCase):

    ROOT_URL = '/api/usage_stats/'

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

    def test_authenticated_superuser_gets_stats(self):
        self.client.login(username=self.ADMIN_USERNAME, password=self.ADMIN_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_stats_summary/')
        self.assertEqual(response.status_code, 200)

    def test_authenticated_standard_user_doesnt_get_stats(self):
        self.client.login(username=self.STD_USER, password=self.STD_USER_PASSWORD)
        response = self.client.get(f'{self.ROOT_URL}get_stats_summary/')
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_doesnt_get_stats(self):
        response = self.client.get(f'{self.ROOT_URL}get_stats_summary/')
        self.assertEqual(response.status_code, 403)