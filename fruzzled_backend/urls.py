from django.contrib import admin
from django.urls import path, include
from .views import logout_route
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path("accounts/", include("allauth.urls")),
    path('admin/', admin.site.urls),
    path('api/api-auth/', include('rest_framework.urls')),
    path('api/dj-rest-auth/logout/', logout_route),
    path('api/dj-rest-auth/', include('dj_rest_auth.urls')),
    path('api/dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/', include('sudoku.urls')),
    path('api/', include('player_profile.urls')),
    path('api/crossword_builder/', include('crosswords.urls')),
    path('api/', include('anagrams.urls')),
    path('api/usage_stats/', include('usage_stats.urls'))
]

handler404 = TemplateView.as_view(template_name='index.html')
