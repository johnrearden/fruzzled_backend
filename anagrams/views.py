from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Anagram, AnagramSeries
from .serializers import AnagramSerializer, AnagramSeriesSerializer
from random import choice


class AnagramSeriesList(generics.ListCreateAPIView):
    queryset = AnagramSeries.objects.all()
    authentication_classes = []
    serializer_class = AnagramSeriesSerializer


class GetRandomAnagram(APIView):
    def get(self, request):
        queryset = AnagramSeries.objects.all()
        series = choice(queryset)

        serializer = AnagramSeriesSerializer(series)

        return Response(serializer.data)


