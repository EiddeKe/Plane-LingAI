# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Generated migration: add is_pending to ProjectMember for join approval workflow
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0122_alter_draftissue_assignees_alter_issue_assignees_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="projectmember",
            name="is_pending",
            field=models.BooleanField(
                default=False,
                help_text="Whether the membership is awaiting approval",
            ),
        ),
    ]
