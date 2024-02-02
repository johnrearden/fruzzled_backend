from django.http import JsonResponse
from rest_framework import generics, permissions
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


class CreateNewAnagramSeries(APIView):

    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        series = AnagramSeries(creator=request.user)
        series.save()
        words = request.POST['words'].split(',')
        print(words)
        for word in words:
            anagram = Anagram(
                word=word,
                creator=request.user,
                series=series,
            )
            anagram.save()

        return JsonResponse({'data' : 'Yo yo yo!'})


