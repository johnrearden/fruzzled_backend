# Generated by Django 3.2.2 on 2024-01-25 15:25

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PlayerProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nickname', models.CharField(max_length=32, unique=True)),
                ('country', models.CharField(default='IE', max_length=2)),
                ('uuid', models.CharField(blank=True, max_length=256, null=True)),
            ],
        ),
    ]
