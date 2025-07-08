"""
GA4 ve YouTube'dan gelen verileri veritabanına kaydeden yardımcı fonksiyonlar.
"""

from ..models import (
    GA4UserAcquisitionSourceData,
    GA4SessionSourceMediumData,
    GA4OperatingSystemData,
    GA4UserGenderData,
    GA4DeviceCategoryData,
    GA4CountryData,
    GA4CityData,
    GA4AgeData,
    YouTubeTrafficSourceData,
    YouTubeDeviceTypeData,
    YouTubeAgeGroupData,
    YouTubeTopSubscribersData,
)
from apps.accounts.models import CompanyProfile


class GA4DataSaver:
    """GA4 Data Saver Class"""

    @staticmethod
    def save_user_acquisition_source_data(company_id, data):
        """Save User Acquisition Source Data"""
        company = CompanyProfile.objects.get(id=company_id)

        # Clear existing data
        GA4UserAcquisitionSourceData.objects.filter(company=company).delete()

        # Save new data
        for item in data:
            GA4UserAcquisitionSourceData.objects.create(
                company=company,
                acquisition_source=item["acquisition_source"],
                new_users=item["new_users"],
                sessions=item["sessions"],
                engagement_rate=item["engagement_rate"],
                user_engagement_duration=item["user_engagement_duration"],
                conversions=item["conversions"],
            )

    @staticmethod
    def save_session_source_medium_data(company_id, data):
        """Save Session Source Medium Data"""
        company = CompanyProfile.objects.get(id=company_id)
        GA4SessionSourceMediumData.objects.filter(company=company).delete()

        for item in data:
            GA4SessionSourceMediumData.objects.create(
                company=company,
                session_source_medium=item["session_source_medium"],
                sessions=item["sessions"],
                conversions=item["conversions"],
                engagement_rate=item["engagement_rate"],
                event_count=item["event_count"],
                bounce_rate=item["bounce_rate"],
            )

    @staticmethod
    def save_operating_system_data(company_id, data):
        """Save Operating System Data"""
        company = CompanyProfile.objects.get(id=company_id)
        GA4OperatingSystemData.objects.filter(company=company).delete()

        for item in data:
            GA4OperatingSystemData.objects.create(
                company=company,
                operating_system=item["operating_system"],
                active_users=item["active_users"],
                engaged_sessions=item["engaged_sessions"],
                engagement_rate=item["engagement_rate"],
                user_engagement_duration=item["user_engagement_duration"],
                event_count=item["event_count"],
                bounce_rate=item["bounce_rate"],
            )

    @staticmethod
    def save_age_data(company_id, data):
        """Save Age Data"""
        company = CompanyProfile.objects.get(id=company_id)
        GA4AgeData.objects.filter(company=company).delete()

        for item in data:
            GA4AgeData.objects.create(
                company=company,
                age=item["age"],
                active_users=item["active_users"],
                sessions=item["sessions"],
                user_engagement_duration=item["user_engagement_duration"],
                event_count=item["event_count"],
                conversions=item["conversions"],
            )

    @staticmethod
    def save_country_data(company_id, data):
        """Save Country Data"""
        company = CompanyProfile.objects.get(id=company_id)
        GA4CountryData.objects.filter(company=company).delete()

        for item in data:
            GA4CountryData.objects.create(
                company=company,
                country=item["country"],
                active_users=item["active_users"],
                new_users=item["new_users"],
                sessions=item["sessions"],
                user_engagement_duration=item["user_engagement_duration"],
                event_count=item["event_count"],
                engagement_rate=item["engagement_rate"],
                conversions=item["conversions"],
                bounce_rate=item["bounce_rate"],
            )

    @staticmethod
    def save_city_data(company_id, data):
        """Save City Data"""
        company = CompanyProfile.objects.get(id=company_id)
        GA4CityData.objects.filter(company=company).delete()

        for item in data:
            GA4CityData.objects.create(
                company=company,
                city=item["city"],
                active_users=item["active_users"],
                sessions=item["sessions"],
                user_engagement_duration=item["user_engagement_duration"],
                event_count=item["event_count"],
                conversions=item["conversions"],
            )

    @staticmethod
    def save_device_category_data(company_id, data):
        """Save Device Category Data"""
        company = CompanyProfile.objects.get(id=company_id)
        GA4DeviceCategoryData.objects.filter(company=company).delete()

        for item in data:
            GA4DeviceCategoryData.objects.create(
                company=company,
                device_category=item["device_category"],
                active_users=item["active_users"],
                engaged_sessions=item["engaged_sessions"],
                user_engagement_duration=item["user_engagement_duration"],
                event_count=item["event_count"],
                bounce_rate=item["bounce_rate"],
            )

    @staticmethod
    def save_user_gender_data(company_id, data):
        """Save User Gender Data"""
        company = CompanyProfile.objects.get(id=company_id)
        GA4UserGenderData.objects.filter(company=company).delete()

        for item in data:
            GA4UserGenderData.objects.create(
                company=company,
                gender=item["gender"],
                sessions=item["sessions"],
                engagement_rate=item["engagement_rate"],
                user_engagement_duration=item["user_engagement_duration"],
                event_count=item["event_count"],
            )


class YouTubeDataSaver:
    """YouTube Data Saver Class"""

    @staticmethod
    def save_traffic_source_data(company_id, data):
        """Save Traffic Source Data"""
        company = CompanyProfile.objects.get(id=company_id)
        YouTubeTrafficSourceData.objects.filter(company=company).delete()

        for item in data:
            YouTubeTrafficSourceData.objects.create(
                company=company,
                insight_traffic_source_type=item["insightTrafficSourceType"],
                views=item["views"],
                average_view_duration=item["averageViewDuration"],
                estimated_minutes_watched=item["estimatedMinutesWatched"],
            )

    @staticmethod
    def save_device_type_data(company_id, data):
        """Save Device Type Data"""
        company = CompanyProfile.objects.get(id=company_id)
        YouTubeDeviceTypeData.objects.filter(company=company).delete()

        for item in data:
            YouTubeDeviceTypeData.objects.create(
                company=company,
                device_type=item["deviceType"],
                views=item["views"],
                average_view_duration=item["averageViewDuration"],
                estimated_minutes_watched=item["estimatedMinutesWatched"],
            )

    @staticmethod
    def save_age_group_data(company_id, data):
        """Save Age Group Data"""
        company = CompanyProfile.objects.get(id=company_id)
        YouTubeAgeGroupData.objects.filter(company=company).delete()

        for item in data:
            YouTubeAgeGroupData.objects.create(
                company=company,
                age_group=item["ageGroup"],
                gender=item["gender"],
                viewer_percentage=item["viewerPercentage"],
            )

    @staticmethod
    def save_top_subscribers_data(company_id, data):
        """Save Top Subscribers Data"""
        company = CompanyProfile.objects.get(id=company_id)
        YouTubeTopSubscribersData.objects.filter(company=company).delete()

        for item in data:
            YouTubeTopSubscribersData.objects.create(
                company=company,
                video_id=item["video"],
                subscribers_gained=item["subscribersGained"],
                subscribers_lost=item["subscribersLost"],
                views=item["views"],
            )
