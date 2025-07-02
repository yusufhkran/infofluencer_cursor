from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric
from google.oauth2.credentials import Credentials

def get_ga4_report(report_type, access_token, refresh_token, client_id, client_secret, property_id):
    """GA4 Report Dispatcher - Updated to match your existing functions"""
    
    # Create credentials
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret
    )
    
    # Report function mapping
    report_functions = {
        'userAcquisitionSource': run_userAcquisitionSource_report,
        'sessionSourceMedium': run_sessionSourceMedium_report,
        'operatingSystem': run_operatingSystem_report,
        'userGender': run_userGender_report,
        'deviceCategory': run_deviceCategory_report,
        'country': run_country_report,
        'city': run_city_report,
        'age': run_age_report,
    }
    
    if report_type not in report_functions:
        raise ValueError(f"Unsupported GA4 report type: {report_type}")
    
    # Call the specific report function
    return report_functions[report_type](access_token, refresh_token, client_id, client_secret, property_id)

def run_userAcquisitionSource_report(access_token, refresh_token, client_id, client_secret, property_id, token_uri="https://oauth2.googleapis.com/token"):
    # Dinamik olarak kimlik bilgilerini oluştur
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret
    )

    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="sessionSource")],
        metrics=[
            Metric(name="newUsers"),
            Metric(name="sessions"),
            Metric(name="engagementRate"),
            Metric(name="userEngagementDuration"),
            Metric(name="conversions")
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="2025-05-27")]
    )

    response = client.run_report(request)

    data = []
    for row in response.rows:
        data.append({
            "acquisition_source": row.dimension_values[0].value,
            "new_users": int(row.metric_values[0].value),
            "sessions": int(row.metric_values[1].value),
            "engagement_rate": float(row.metric_values[2].value),
            "user_engagement_duration": float(row.metric_values[3].value),
            "conversions": int(row.metric_values[4].value)
        })

    return data

def run_sessionSourceMedium_report(access_token, refresh_token, client_id, client_secret, property_id, token_uri="https://oauth2.googleapis.com/token"):
    # Kimlik bilgilerini oluştur
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret
    )

    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="sessionSourceMedium")],
        metrics=[
            Metric(name="sessions"),
            Metric(name="conversions"),
            Metric(name="engagementRate"),
            Metric(name="eventCount"),
            Metric(name="bounceRate")
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="2025-05-27")]
    )

    response = client.run_report(request)

    data = []
    for row in response.rows:
        data.append({
            "session_source_medium": row.dimension_values[0].value,
            "sessions": int(row.metric_values[0].value),
            "conversions": int(row.metric_values[1].value),
            "engagement_rate": float(row.metric_values[2].value),
            "event_count": int(row.metric_values[3].value),
            "bounce_rate": float(row.metric_values[4].value)
        })

    return data

def run_operatingSystem_report(access_token, refresh_token, client_id, client_secret, property_id, token_uri="https://oauth2.googleapis.com/token"):
    # Kimlik bilgilerini oluştur
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret
    )

    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="operatingSystem")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="engagedSessions"),
            Metric(name="engagementRate"),
            Metric(name="userEngagementDuration"),
            Metric(name="eventCount"),
            Metric(name="bounceRate"),
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="2025-05-27")]
    )

    response = client.run_report(request)

    data = []
    for row in response.rows:
        data.append({
            "operating_system": row.dimension_values[0].value,
            "active_users": int(row.metric_values[0].value),
            "engaged_sessions": int(row.metric_values[1].value),
            "engagement_rate": float(row.metric_values[2].value),
            "user_engagement_duration": float(row.metric_values[3].value),
            "event_count": float(row.metric_values[4].value),
            "bounce_rate": float(row.metric_values[5].value),
        })

    return data

def run_userGender_report(access_token, refresh_token, client_id, client_secret, property_id, token_uri="https://oauth2.googleapis.com/token"):
    # Kimlik bilgilerini oluştur
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret
    )

    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="userGender")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="sessions"),
            Metric(name="engagementRate"),
            Metric(name="userEngagementDuration"),
            Metric(name="eventCount"),
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="2025-05-27")]
    )

    response = client.run_report(request)

    data = []
    for row in response.rows:
        data.append({
            "gender": row.dimension_values[0].value,
            "sessions": int(row.metric_values[1].value),  # Fixed: activeUsers was mapped to sessions
            "engagement_rate": float(row.metric_values[2].value),  # Fixed: sessions was mapped to engagement_rate
            "user_engagement_duration": float(row.metric_values[3].value),
            "event_count": float(row.metric_values[4].value),
        })

    return data

def run_deviceCategory_report(access_token, refresh_token, client_id, client_secret, property_id, token_uri="https://oauth2.googleapis.com/token"):
    # Kimlik bilgilerini oluştur
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret
    )

    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="deviceCategory")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="engagedSessions"),
            Metric(name="engagementRate"),
            Metric(name="userEngagementDuration"),
            Metric(name="eventCount"),
            Metric(name="bounceRate"),
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="2025-05-27")]
    )

    response = client.run_report(request)

    data = []
    for row in response.rows:
        data.append({
            "device_category": row.dimension_values[0].value,
            "active_users": int(row.metric_values[0].value),
            "engaged_sessions": int(row.metric_values[1].value),
            "user_engagement_duration": float(row.metric_values[3].value),
            "event_count": float(row.metric_values[4].value),
            "bounce_rate": float(row.metric_values[5].value),
        })

    return data

def run_country_report(access_token, refresh_token, client_id, client_secret, property_id, token_uri="https://oauth2.googleapis.com/token"):
    # Kimlik bilgilerini oluştur
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret
    )

    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="country")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="newUsers"),
            Metric(name="sessions"),
            Metric(name="userEngagementDuration"),
            Metric(name="eventCount"),
            Metric(name="engagementRate"),
            Metric(name="conversions"),
            Metric(name="bounceRate"),
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="2025-05-27")]
    )

    response = client.run_report(request)

    data = []
    for row in response.rows:
        data.append({
            "country": row.dimension_values[0].value,
            "active_users": int(row.metric_values[0].value),
            "new_users": int(row.metric_values[1].value),
            "sessions": int(row.metric_values[2].value),
            "user_engagement_duration": float(row.metric_values[3].value),
            "event_count": float(row.metric_values[4].value),
            "engagement_rate": float(row.metric_values[5].value),
            "conversions": float(row.metric_values[6].value),
            "bounce_rate": float(row.metric_values[7].value),
        })

    return data

def run_city_report(access_token, refresh_token, client_id, client_secret, property_id, token_uri="https://oauth2.googleapis.com/token"):
    # Kimlik bilgilerini oluştur
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret
    )

    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="city")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="sessions"),
            Metric(name="userEngagementDuration"),
            Metric(name="eventCount"),
            Metric(name="conversions"),
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="2025-05-27")]
    )

    response = client.run_report(request)

    data = []
    for row in response.rows:
        data.append({
            "city": row.dimension_values[0].value,
            "active_users": int(row.metric_values[0].value),
            "sessions": int(row.metric_values[1].value),
            "user_engagement_duration": float(row.metric_values[2].value),
            "event_count": float(row.metric_values[3].value),
            "conversions": float(row.metric_values[4].value),
        })

    return data

def run_age_report(access_token, refresh_token, client_id, client_secret, property_id, token_uri="https://oauth2.googleapis.com/token"):
    # Kimlik bilgilerini oluştur
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret
    )

    client = BetaAnalyticsDataClient(credentials=creds)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="userAgeBracket")],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="sessions"),
            Metric(name="userEngagementDuration"),
            Metric(name="eventCount"),
            Metric(name="conversions"),
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="2025-05-27")]
    )

    response = client.run_report(request)

    data = []
    for row in response.rows:
        data.append({
            "age": row.dimension_values[0].value,
            "active_users": int(row.metric_values[0].value),
            "sessions": int(row.metric_values[1].value),
            "user_engagement_duration": float(row.metric_values[2].value),
            "event_count": float(row.metric_values[3].value),
            "conversions": float(row.metric_values[4].value),
        })

    return data