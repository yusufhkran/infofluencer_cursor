"""
Dashboard ve analytics ile ilgili endpointleri içerir.
Kitle, trafik, cihaz, genel özet ve influencer dashboard fonksiyonları burada bulunur.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import (
    GA4Token,
    YouTubeToken,
    GA4AgeData,
    GA4UserGenderData,
    GA4CountryData,
    YouTubeAgeGroupData,
    GA4CityData,
    GA4UserAcquisitionSourceData,
    GA4SessionSourceMediumData,
    GA4DeviceCategoryData,
    GA4OperatingSystemData,
)
from apps.accounts.models import CompanyProfile, InfluencerProfile
from .helpers import is_known, percent_distribution, top_n


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_overview(request):
    """
    Dashboard overview verisi - Frontend için özet metrikler döner.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        user_acquisition = GA4UserAcquisitionSourceData.objects.filter(
            company=company_profile
        )
        if user_acquisition.exists():
            total_sessions = sum([item.sessions for item in user_acquisition])
            total_users = sum([item.new_users for item in user_acquisition])
            avg_engagement = sum(
                [item.engagement_rate for item in user_acquisition]
            ) / len(user_acquisition)
            avg_bounce = 65.0
            return Response(
                {
                    "success": True,
                    "data": {
                        "totalSessions": total_sessions,
                        "activeUsers": total_users,
                        "engagementRate": round(avg_engagement, 1),
                        "bounceRate": avg_bounce,
                        "sessionGrowth": 12.5,
                        "userGrowth": 8.3,
                        "engagementGrowth": 15.7,
                        "bounceGrowth": -5.2,
                    },
                }
            )
        else:
            return Response(
                {
                    "success": False,
                    "data": None,
                    "message": "No analytics data available yet",
                }
            )
    except CompanyProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "Company profile not found"}, status=404
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def audience_insights(request):
    """
    Audience Demographics Dashboard: Yaş, cinsiyet, ülke dağılımı döner.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        age_data = GA4AgeData.objects.filter(company=company_profile).order_by(
            "-active_users"
        )
        age_distribution = [
            {
                "age_group": item.age,
                "users": item.active_users,
                "sessions": item.sessions,
                "engagement_duration": round(item.user_engagement_duration, 1),
            }
            for item in age_data
        ]
        try:
            gender_data = GA4UserGenderData.objects.filter(company=company_profile)
            gender_distribution = [
                {
                    "gender": item.gender,
                    "sessions": item.sessions,
                    "engagement_rate": round(item.engagement_rate, 2),
                }
                for item in gender_data
            ]
        except:
            gender_distribution = []
        country_data = GA4CountryData.objects.filter(company=company_profile).order_by(
            "-active_users"
        )
        geographic_distribution = [
            {
                "country": item.country,
                "users": item.active_users,
                "sessions": item.sessions,
                "bounce_rate": round(item.bounce_rate, 2),
            }
            for item in country_data
        ]
        return Response(
            {
                "success": True,
                "data": {
                    "age_distribution": age_distribution,
                    "gender_distribution": gender_distribution,
                    "geographic_distribution": geographic_distribution,
                },
            }
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def audience_insights_combined(request):
    """
    GA4 ve YouTube kitle verilerini harmanlayıp ortalamasını döner (oranlarla, ilk 5 ülke ve şehir, unknowns hariç).
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)

        def is_known(val):
            v = (val or "").strip().lower()
            return v not in [
                "unknown",
                "bilinmiyor",
                "bilinmeyen",
                "",
                "(not set)",
                "not set",
            ]

        ga4_ages = {
            item.age: item
            for item in GA4AgeData.objects.filter(company=company_profile)
            if is_known(item.age)
        }
        yt_ages = {}
        for item in YouTubeAgeGroupData.objects.filter(company=company_profile):
            if not is_known(item.age_group):
                continue
            if item.age_group not in yt_ages:
                yt_ages[item.age_group] = {"users": 0, "sessions": 0, "count": 0}
            yt_ages[item.age_group]["users"] += item.viewer_percentage
            yt_ages[item.age_group]["count"] += 1
        all_age_groups = set(list(ga4_ages.keys()) + list(yt_ages.keys()))
        age_distribution_raw = []
        for age in all_age_groups:
            if not is_known(age):
                continue
            ga4 = ga4_ages.get(age)
            yt = yt_ages.get(age)
            if ga4 and yt:
                users = (ga4.active_users + yt["users"]) / 2
                sessions = (ga4.sessions + yt["users"]) / 2
                engagement_duration = ga4.user_engagement_duration
            elif ga4:
                users = ga4.active_users
                sessions = ga4.sessions
                engagement_duration = ga4.user_engagement_duration
            elif yt:
                users = yt["users"]
                sessions = yt["users"]
                engagement_duration = 0
            else:
                continue
            age_distribution_raw.append(
                {
                    "age_group": age,
                    "users": users,
                    "sessions": sessions,
                    "engagement_duration": engagement_duration,
                }
            )
        total_users_age = sum(x["users"] for x in age_distribution_raw) or 1
        total_sessions_age = sum(x["sessions"] for x in age_distribution_raw) or 1
        age_distribution = []
        for row in age_distribution_raw:
            age_distribution.append(
                {
                    "age_group": row["age_group"],
                    "users": round(100 * row["users"] / total_users_age, 1),
                    "sessions": round(100 * row["sessions"] / total_sessions_age, 1),
                    "engagement_duration": round(row["engagement_duration"], 1),
                }
            )
        ga4_genders = {
            item.gender: item
            for item in GA4UserGenderData.objects.filter(company=company_profile)
            if is_known(item.gender)
        }
        yt_genders = {}
        for item in YouTubeAgeGroupData.objects.filter(company=company_profile):
            if not is_known(item.gender):
                continue
            if item.gender not in yt_genders:
                yt_genders[item.gender] = {"sessions": 0, "count": 0}
            yt_genders[item.gender]["sessions"] += item.viewer_percentage
            yt_genders[item.gender]["count"] += 1
        all_genders = set(list(ga4_genders.keys()) + list(yt_genders.keys()))
        gender_distribution_raw = []
        for gender in all_genders:
            if not is_known(gender):
                continue
            ga4 = ga4_genders.get(gender)
            yt = yt_genders.get(gender)
            if ga4 and yt:
                sessions = (ga4.sessions + yt["sessions"]) / 2
                engagement_rate = ga4.engagement_rate
            elif ga4:
                sessions = ga4.sessions
                engagement_rate = ga4.engagement_rate
            elif yt:
                sessions = yt["sessions"]
                engagement_rate = 0
            else:
                continue
            gender_distribution_raw.append(
                {
                    "gender": gender,
                    "sessions": sessions,
                    "engagement_rate": engagement_rate,
                }
            )
        total_sessions_gender = sum(x["sessions"] for x in gender_distribution_raw) or 1
        gender_distribution = []
        for row in gender_distribution_raw:
            gender_distribution.append(
                {
                    "gender": row["gender"],
                    "sessions": round(100 * row["sessions"] / total_sessions_gender, 1),
                    "engagement_rate": round(row["engagement_rate"], 2),
                }
            )
        ga4_countries = {
            item.country: item
            for item in GA4CountryData.objects.filter(company=company_profile)
            if is_known(item.country)
        }
        country_distribution_raw = []
        for country, item in ga4_countries.items():
            if not is_known(country):
                continue
            country_distribution_raw.append(
                {
                    "country": country,
                    "users": item.active_users,
                    "sessions": item.sessions,
                    "bounce_rate": round(item.bounce_rate, 2),
                }
            )
        country_distribution_raw.sort(key=lambda x: x["users"], reverse=True)
        country_distribution_raw = country_distribution_raw[:5]
        total_users_country = sum(x["users"] for x in country_distribution_raw) or 1
        total_sessions_country = (
            sum(x["sessions"] for x in country_distribution_raw) or 1
        )
        country_distribution = []
        for row in country_distribution_raw:
            country_distribution.append(
                {
                    "country": row["country"],
                    "users": round(100 * row["users"] / total_users_country, 1),
                    "sessions": round(
                        100 * row["sessions"] / total_sessions_country, 1
                    ),
                    "bounce_rate": row["bounce_rate"],
                }
            )
        ga4_cities = {
            item.city: item
            for item in GA4CityData.objects.filter(company=company_profile)
            if is_known(item.city)
        }
        city_distribution_raw = []
        for city, item in ga4_cities.items():
            if not is_known(city):
                continue
            city_distribution_raw.append(
                {
                    "city": city,
                    "users": item.active_users,
                    "sessions": item.sessions,
                }
            )
        city_distribution_raw.sort(key=lambda x: x["users"], reverse=True)
        city_distribution_raw = city_distribution_raw[:5]
        total_users_city = sum(x["users"] for x in city_distribution_raw) or 1
        total_sessions_city = sum(x["sessions"] for x in city_distribution_raw) or 1
        city_distribution = []
        for row in city_distribution_raw:
            city_distribution.append(
                {
                    "city": row["city"],
                    "users": round(100 * row["users"] / total_users_city, 1),
                    "sessions": round(100 * row["sessions"] / total_sessions_city, 1),
                }
            )
        return Response(
            {
                "success": True,
                "data": {
                    "age_distribution": age_distribution,
                    "gender_distribution": gender_distribution,
                    "geographic_distribution": country_distribution,
                    "city_distribution": city_distribution,
                },
                "note": "GA4 ve YouTube verileri harmanlanıp sunulmuştur.",
            }
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def traffic_analysis(request):
    """
    Traffic Sources and Behavior Analysis: Trafik kaynakları, cihaz ve teknoloji dağılımı döner.
    """
    try:
        company_profile = CompanyProfile.objects.get(user=request.user)
        acquisition_data = GA4UserAcquisitionSourceData.objects.filter(
            company=company_profile
        )
        acquisition_analysis = [
            {
                "source": item.acquisition_source,
                "new_users": item.new_users,
                "sessions": item.sessions,
                "engagement_rate": round(item.engagement_rate, 2),
                "conversions": item.conversions,
                "user_engagement_duration": round(item.user_engagement_duration, 1),
            }
            for item in acquisition_data.order_by("-new_users")
        ]
        session_data = GA4SessionSourceMediumData.objects.filter(
            company=company_profile
        )
        session_analysis = [
            {
                "source_medium": item.session_source_medium,
                "sessions": item.sessions,
                "conversions": item.conversions,
                "engagement_rate": round(item.engagement_rate, 2),
                "bounce_rate": round(item.bounce_rate, 2),
            }
            for item in session_data.order_by("-sessions")
        ]
        device_data = GA4DeviceCategoryData.objects.filter(company=company_profile)
        technology_breakdown = {
            "devices": [
                {
                    "category": item.device_category,
                    "users": item.active_users,
                    "sessions": item.engaged_sessions,
                    "bounce_rate": round(item.bounce_rate, 2),
                }
                for item in device_data
            ]
        }
        try:
            os_data = GA4OperatingSystemData.objects.filter(company=company_profile)
            technology_breakdown["operating_systems"] = [
                {
                    "os": item.operating_system,
                    "users": item.active_users,
                    "sessions": item.engaged_sessions,
                    "engagement_rate": round(item.engagement_rate, 2),
                }
                for item in os_data.order_by("-active_users")[:10]
            ]
        except:
            technology_breakdown["operating_systems"] = []
        return Response(
            {
                "success": True,
                "data": {
                    "acquisition_channels": acquisition_analysis,
                    "session_sources": session_analysis,
                    "technology_breakdown": technology_breakdown,
                },
            }
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def influencer_overview(request):
    """
    Influencer Dashboard Overview: Influencer profil ve metriklerini döner.
    """
    try:
        influencer_profile = InfluencerProfile.objects.get(user=request.user)
        return Response(
            {
                "success": True,
                "data": {
                    "profile": {
                        "name": f"{influencer_profile.first_name} {influencer_profile.last_name}",
                        "email": influencer_profile.email,
                        "instagram_handle": getattr(
                            influencer_profile, "instagram_handle", ""
                        ),
                        "youtube_channel_id": getattr(
                            influencer_profile, "youtube_channel_id", ""
                        ),
                    },
                    "metrics": {
                        "total_followers": 0,
                        "engagement_rate": 0.0,
                        "monthly_growth": 0.0,
                        "brand_collaborations": 0,
                    },
                },
                "message": "Influencer analytics coming soon",
            }
        )
    except InfluencerProfile.DoesNotExist:
        return Response({"error": "Influencer profile not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
