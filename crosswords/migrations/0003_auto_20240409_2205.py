# Generated by Django 3.2.2 on 2024-04-09 22:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crosswords', '0002_crosswordinstance'),
    ]

    operations = [
        migrations.AddField(
            model_name='crosswordpuzzle',
            name='instances_created',
            field=models.IntegerField(default=0),
        ),
        migrations.AddIndex(
            model_name='crosswordinstance',
            index=models.Index(fields=['time_taken'], name='crosswords__time_ta_4fb9ea_idx'),
        ),
    ]