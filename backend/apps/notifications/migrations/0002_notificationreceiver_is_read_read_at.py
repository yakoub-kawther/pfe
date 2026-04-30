from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='notificationreceiver',
            name='is_read',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='notificationreceiver',
            name='read_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]