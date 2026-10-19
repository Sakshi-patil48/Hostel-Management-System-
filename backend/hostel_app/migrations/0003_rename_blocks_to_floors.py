from django.db import migrations

def rename_blocks_to_floors(apps, schema_editor):
    HostelBlock = apps.get_model('hostel_app', 'HostelBlock')

    mapping = {
        'Block A - North Wing': 'Floor 1',
        'Block B - South Wing': 'Floor 2',
        'Block C - PG Wing': 'Floor 3',
        'Block A': 'Floor 1',
        'Block B': 'Floor 2',
        'Block C': 'Floor 3',
    }

    for old_name, new_name in mapping.items():
        HostelBlock.objects.filter(name=old_name).update(name=new_name)

def reverse_rename(apps, schema_editor):
    HostelBlock = apps.get_model('hostel_app', 'HostelBlock')
    reverse_mapping = {
        'Floor 1': 'Block A - North Wing',
        'Floor 2': 'Block B - South Wing',
        'Floor 3': 'Block C - PG Wing',
    }
    for new_name, old_name in reverse_mapping.items():
        HostelBlock.objects.filter(name=new_name).update(name=old_name)

class Migration(migrations.Migration):

    dependencies = [
        ('hostel_app', '0002_alter_attendance_date_and_more'),
    ]

    operations = [
        migrations.RunPython(rename_blocks_to_floors, reverse_rename),
    ]
