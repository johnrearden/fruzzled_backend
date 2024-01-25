from django.urls import path
from . import views

urlpatterns = [
    path(
        'create_player_profile/',
        views.CreatePlayerProfile.as_view(),
        name='create_player_profile'),
    path('is_nickname_available/', views.IsNicknameAvailable.as_view()),
    path('player_profile/', views.RetrievePlayerProfile.as_view()),
]