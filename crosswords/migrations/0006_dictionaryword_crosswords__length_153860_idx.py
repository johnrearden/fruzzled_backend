# Generated by Django 3.2.2 on 2024-04-13 06:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crosswords', '0005_crosswordpuzzle_instances_completed'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='dictionaryword',
            index=models.Index(fields=['length'], name='crosswords__length_153860_idx'),
        ),
    ]
