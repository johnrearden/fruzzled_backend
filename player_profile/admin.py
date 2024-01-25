from django.contrib import admin
from .models import PlayerProfile


class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'nickname', 'country', 'uuid']
    list_editable = ['nickname', 'country', 'uuid']


admin.site.register(PlayerProfile, PlayerProfileAdmin)
