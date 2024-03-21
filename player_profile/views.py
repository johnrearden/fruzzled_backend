from django.shortcuts import render, get_object_or_404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.renderers import BrowsableAPIRenderer, HTMLFormRenderer

from fruzzled_backend.permissions import HasPlayerProfileCookie
from .serializers import PlayerProfileSerializer
from .models import PlayerProfile


class CreatePlayerProfile(APIView):
    http_method_names = ['get', 'post']
    serializer_class = PlayerProfileSerializer

    def post(self, request):
        serializer = PlayerProfileSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            instance = serializer.save()
            response = Response(status=status.HTTP_201_CREATED)
            response.set_cookie(
                key=settings.PLAYER_PROFILE_COOKIE,
                value=instance.uuid,
                secure=True,
                samesite='None',
                )
            response.data = serializer.data
            return response


class RetrievePlayerProfile(APIView):
    permission_classes = [HasPlayerProfileCookie]
    authentication_classes = []

    def get(self, request):
        profile_cookie = request.COOKIES.get(settings.PLAYER_PROFILE_COOKIE, '')
        profile = get_object_or_404(PlayerProfile, uuid=profile_cookie)
        serializer = PlayerProfileSerializer(profile)
        return Response(serializer.data)



class IsNicknameAvailable(APIView):
    http_method_names = ['get']

    def get(self, request):
        query = request.GET['nickname'] if request.GET else None
        if query:
            exists = PlayerProfile.objects.filter(nickname=query).exists()
            boolean_value = 'true' if not exists else 'false'
            response = Response(
                status=status.HTTP_200_OK,
                data={'available': boolean_value}
            )
            return response
        else:
            response = Response(
                status=status.HTTP_200_OK,
                data={'available': 'true'}
            )
            return response