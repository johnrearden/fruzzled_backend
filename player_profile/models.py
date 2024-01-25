from django.db import models
import uuid


class PlayerProfile(models.Model):
    nickname = models.CharField(max_length=32, unique=True)
    country = models.CharField(max_length=2, default="IE")
    uuid = models.CharField(max_length=256, null=True, blank=True)

    def __str__(self):
        return f'{self.nickname} from {self.country}'

    def save(self, *args, **kwargs):
        if not self.uuid:
            self.uuid = uuid.uuid4()
        super().save(*args, **kwargs)

