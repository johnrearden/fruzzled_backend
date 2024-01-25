from rest_framework import permissions
from django.conf import settings
from player_profile.models import PlayerProfile


class IsOwnerOrReadOnly(permissions.BasePermission):
  def has_object_permission(self, request, view, obj):
    print(f'user is superuser : {request.user.is_staff}')
    if request.method in permissions.SAFE_METHODS:
      return True
    return obj.owner == request.user


class HasPlayerProfileCookie(permissions.BasePermission):
    message = 'No player profile'

    def has_permission(self, request, view):
        profile_cookie = request.COOKIES.get(settings.PLAYER_PROFILE_COOKIE, '')
        if profile_cookie:
            profile = PlayerProfile.objects.filter(uuid=profile_cookie).first()
            if (profile):
                return True
        return False