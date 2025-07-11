"""
YouTube API'den rapor verisi çekmek için modern ve sade fonksiyonlar.
"""

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json

def get_youtube_report(report_type, access_token, refresh_token, client_id, client_secret):
    """YouTube Analytics API'den ilgili raporu çeker."""
    try:
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
        )
        service = build("youtubeAnalytics", "v2", credentials=creds)
        if report_type == "trafficSource":
            response = service.reports().query(
                ids="channel==MINE",
                startDate="2025-01-01",
                endDate="2025-06-01",
                dimensions="insightTrafficSourceType",
                metrics="views,averageViewDuration,estimatedMinutesWatched",
                sort="-views",
                maxResults=25,
            ).execute()
        elif report_type == "ageGroup":
            response = service.reports().query(
                ids="channel==MINE",
                startDate="2025-01-01",
                endDate="2025-06-01",
                dimensions="ageGroup,gender",
                metrics="viewerPercentage",
                sort="-viewerPercentage",
                maxResults=25,
            ).execute()
        elif report_type == "deviceType":
            response = service.reports().query(
                ids="channel==MINE",
                startDate="2025-01-01",
                endDate="2025-06-01",
                dimensions="deviceType",
                metrics="views,averageViewDuration,estimatedMinutesWatched",
                sort="-views",
                maxResults=25,
            ).execute()
        else:
            return []
        headers = [h["name"] for h in response.get("columnHeaders", [])]
        return [dict(zip(headers, row)) for row in response.get("rows", [])]
    except HttpError as e:
        try:
            error = json.loads(e.content.decode("utf-8"))
            return [{"error": error.get("error", {}).get("message", str(e))}]
        except:
            return [{"error": str(e)}]
    except Exception as e:
        return [{"error": str(e)}]
