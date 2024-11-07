from django.urls import path
from . import views

urlpatterns = [
    path(
        'get_stats_summary/',
        views.StatsSummary.as_view(),
        name="stats_summary"
    )
]