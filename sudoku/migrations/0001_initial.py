# Generated by Django 3.2.2 on 2024-01-25 15:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('player_profile', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SudokuPuzzle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grid', models.CharField(max_length=81)),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('difficulty', models.IntegerField(choices=[(0, 'Easy'), (1, 'Medium'), (2, 'Hard'), (3, 'Vicious')], default=0)),
                ('instances_created', models.IntegerField(default=0)),
                ('instances_completed', models.IntegerField(default=0)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PuzzleInstance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grid', models.CharField(max_length=81)),
                ('started_on', models.DateTimeField()),
                ('completed', models.BooleanField(default=False)),
                ('completed_at', models.DateTimeField()),
                ('time_taken', models.DurationField(null=True)),
                ('owner', models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, related_name='puzzle_instances', to='player_profile.playerprofile')),
                ('puzzle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='instances', to='sudoku.sudokupuzzle')),
            ],
        ),
        migrations.AddIndex(
            model_name='puzzleinstance',
            index=models.Index(fields=['time_taken'], name='sudoku_puzz_time_ta_558fcc_idx'),
        ),
    ]
