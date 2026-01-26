from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid


class PlayerProfile(models.Model):
    nickname = models.CharField(max_length=32, unique=True)
    country = models.CharField(max_length=2, default="IE")
    uuid = models.CharField(max_length=256, null=True, blank=True)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_played_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.nickname} from {self.country}'

    def save(self, *args, **kwargs):
        if not self.uuid:
            self.uuid = uuid.uuid4()
        super().save(*args, **kwargs)

    def update_streak(self):
        """Update streak based on puzzle completion."""
        today = timezone.now().date()

        if self.last_played_date is None:
            # First time playing
            self.current_streak = 1
            self.longest_streak = 1
            self.last_played_date = today
        elif self.last_played_date == today:
            # Already played today, no change needed
            pass
        elif self.last_played_date == today - timedelta(days=1):
            # Played yesterday, extend streak
            self.current_streak += 1
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak
            self.last_played_date = today
        else:
            # Streak broken, start new streak
            self.current_streak = 1
            self.last_played_date = today

        self.save()

