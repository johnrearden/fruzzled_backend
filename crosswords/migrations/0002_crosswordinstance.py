# Generated by Django 3.2.2 on 2024-04-09 21:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('player_profile', '0001_initial'),
        ('crosswords', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CrosswordInstance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('started_on', models.DateTimeField()),
                ('completed_at', models.DateTimeField()),
                ('time_taken', models.DurationField()),
                ('percent_complete', models.FloatField()),
                ('percent_correct', models.FloatField()),
                ('crossword_puzzle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='instances', to='crosswords.crosswordpuzzle')),
                ('owner', models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, related_name='crossword_instances', to='player_profile.playerprofile')),
            ],
        ),
    ]