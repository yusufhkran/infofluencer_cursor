# apps/accounts/admin.py

from django.contrib import admin
from .models import CompanyProfile, InfluencerProfile


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "first_name", "last_name", "work_email", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["first_name", "last_name", "work_email", "user__email"]
    readonly_fields = ["created_at"]

    fieldsets = (
        (
            "User Information",
            {"fields": ("user", "first_name", "last_name", "work_email")},
        ),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )


@admin.register(InfluencerProfile)
class InfluencerProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "first_name",
        "last_name",
        "email",
        "instagram_handle",
        "created_at",
    ]
    list_filter = ["created_at"]
    search_fields = [
        "first_name",
        "last_name",
        "email",
        "instagram_handle",
        "user__email",
    ]
    readonly_fields = ["created_at"]

    fieldsets = (
        ("User Information", {"fields": ("user", "first_name", "last_name", "email")}),
        ("Social Media", {"fields": ("instagram_handle", "youtube_channel_id")}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )
