"""
YouTube API'den rapor verisi çekmek için kullanılan fonksiyonlar.
"""

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json


def get_youtube_report(
    report_type, access_token, refresh_token, client_id, client_secret
):
    """YouTube Report Dispatcher - Updated to match your existing functions"""

    try:
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
        )

        dispatch_table = {
            "trafficSource": run_youtube_report_trafficSource,
            "deviceType": run_youtube_report_deviceType,
            "ageGroup": run_youtube_report_ageGroup,
            "topSubscribers": run_youtube_report_topSubscribers,
        }

        if report_type not in dispatch_table:
            return [{"error": "Desteklenmeyen YouTube dimension: " + report_type}]

        return dispatch_table[report_type](creds)

    except HttpError as e:
        try:
            error = json.loads(e.content.decode("utf-8"))["error"]["errors"][0]
            return [{"error": f"{error.get('reason')} – {error.get('message')}"}]
        except:
            return [{"error": f"HttpError: {str(e)}"}]


def run_youtube_report_trafficSource(credentials):
    service = build("youtubeAnalytics", "v2", credentials=credentials)

    response = (
        service.reports()
        .query(
            ids="channel==MINE",
            startDate="2025-01-01",
            endDate="2025-06-01",
            dimensions="insightTrafficSourceType",
            metrics="views,averageViewDuration,estimatedMinutesWatched",
            sort="-views",
            maxResults=25,
        )
        .execute()
    )

    headers = [h["name"] for h in response.get("columnHeaders", [])]
    return [dict(zip(headers, row)) for row in response.get("rows", [])]


def run_youtube_report_deviceType(credentials):
    service = build("youtubeAnalytics", "v2", credentials=credentials)

    response = (
        service.reports()
        .query(
            ids="channel==MINE",
            startDate="2025-01-01",
            endDate="2025-06-01",
            dimensions="deviceType",
            metrics="views,averageViewDuration,estimatedMinutesWatched",
            sort="-views",
            maxResults=25,
        )
        .execute()
    )

    headers = [h["name"] for h in response.get("columnHeaders", [])]
    return [dict(zip(headers, row)) for row in response.get("rows", [])]


def run_youtube_report_ageGroup(credentials):
    service = build("youtubeAnalytics", "v2", credentials=credentials)

    response = (
        service.reports()
        .query(
            ids="channel==MINE",
            startDate="2025-01-01",
            endDate="2025-06-01",
            dimensions="ageGroup,gender",
            metrics="viewerPercentage",
            sort="-viewerPercentage",
            maxResults=25,
        )
        .execute()
    )

    headers = [h["name"] for h in response.get("columnHeaders", [])]
    return [dict(zip(headers, row)) for row in response.get("rows", [])]


def run_youtube_report_topSubscribers(credentials):
    service = build("youtubeAnalytics", "v2", credentials=credentials)
    response = (
        service.reports()
        .query(
            ids="channel==MINE",
            startDate="2025-01-01",
            endDate="2025-06-01",
            dimensions="video",
            metrics="subscribersGained,subscribersLost,views",
            sort="-subscribersGained",
            maxResults=50,
        )
        .execute()
    )

    headers = [h["name"] for h in response.get("columnHeaders", [])]
    return [dict(zip(headers, row)) for row in response.get("rows", [])]
