"""
GA4 property ID yönetimi ve bağlantı durumu ile ilgili endpointleri içerir.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import GA4Token
from apps.accounts.models import CompanyProfile
from django.db import transaction
from .helpers import is_known, percent_distribution, top_n


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_ga4_property_id(request):
    """
    Kullanıcının mevcut GA4 property ID bilgisini döner.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        token = (
            GA4Token.objects.filter(company=company_profile)
            .order_by("-created_at")
            .first()
        )
        if token and token.property_id:
            return Response({"success": True, "property_id": token.property_id})
        else:
            return Response(
                {
                    "success": False,
                    "property_id": None,
                    "message": "No GA4 property ID found",
                }
            )
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_ga4_property_id(request):
    """
    Kullanıcının GA4 property ID bilgisini kaydeder veya günceller.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        property_id = request.data.get("property_id")
        if not property_id:
            return Response(
                {"success": False, "error": "Property ID is required"}, status=400
            )
        with transaction.atomic():
            token, created = GA4Token.objects.get_or_create(company=company_profile)
            token.property_id = property_id
            token.save()
        return Response(
            {"success": True, "property_id": token.property_id, "created": created}
        )
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_ga4_connection(request):
    """
    Kullanıcının GA4 bağlantı durumunu kontrol eder.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        token = (
            GA4Token.objects.filter(company=company_profile)
            .order_by("-created_at")
            .first()
        )
        if token and token.access_token:
            return Response({"success": True, "connected": True})
        else:
            return Response({"success": True, "connected": False})
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)
