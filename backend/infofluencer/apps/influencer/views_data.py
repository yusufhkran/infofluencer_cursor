import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from .permissions import IsInfluencer
from datetime import datetime, timedelta
import json

# Genişletilmiş profil bilgisi çek

def get_extended_instagram_info(ig_id, page_token):
    fields = 'id,username,profile_picture_url,name,biography,website,followers_count,media_count'
    resp = requests.get(
        f'https://graph.facebook.com/v20.0/{ig_id}',
        params={
            'fields': fields,
            'access_token': page_token
        },
        timeout=10
    )
    if resp.status_code == 200:
        return resp.json()
    return None

def get_facebook_page_info(page_id, page_token):
    fields = 'id,name,emails,location,category_list,category'
    resp = requests.get(
        f'https://graph.facebook.com/v20.0/{page_id}',
        params={
            'fields': fields,
            'access_token': page_token
        },
        timeout=10
    )
    if resp.status_code == 200:
        return resp.json()
    return None

def get_followers_growth(audience_data):
    # audience_data['follower_count']['data'] içinde günlük takipçi sayıları var
    try:
        data = audience_data.get('follower_count', {}).get('data', [])
        if len(data) < 2:
            return 0
        return data[-1]['value'] - data[0]['value']
    except Exception:
        return 0

def get_post_frequency(media_data):
    # Son 30 gün içinde kaç medya var?
    try:
        now = datetime.now()
        count = 0
        for media in media_data.get('media_details', []):
            ts = media.get('timestamp')
            if ts:
                dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                if (now - dt).days <= 30:
                    count += 1
        return count
    except Exception:
        return 0

def get_demographics_data(ig_id, page_token):
    demographic_metrics = [
        'audience_gender_age',
        'audience_locale',
        'audience_country',
        'audience_city'
    ]
    results = {}
    for metric in demographic_metrics:
        resp = requests.get(
            f'https://graph.facebook.com/v20.0/{ig_id}/insights',
            params={
                'metric': metric,
                'period': 'lifetime',
                'access_token': page_token
            },
            timeout=15
        )
        if resp.status_code == 200:
            results[metric] = resp.json()
        else:
            results[metric] = {'error': resp.text}
    return results

def get_audience_data(ig_id, page_token):
    since_date = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
    until_date = datetime.now().strftime('%Y-%m-%d')
    audience_metrics = [
        'reach',
        'profile_views',
        'website_clicks',
        'follower_count'
    ]
    results = {}
    for metric in audience_metrics:
        resp = requests.get(
            f'https://graph.facebook.com/v20.0/{ig_id}/insights',
            params={
                'metric': metric,
                'period': 'day',
                'since': since_date,
                'until': until_date,
                'access_token': page_token
            },
            timeout=15
        )
        if resp.status_code == 200:
            results[metric] = resp.json()
        else:
            results[metric] = {'error': resp.text}
    return results

def get_story_insights(ig_id, page_token):
    story_metrics = [
        'story_impressions',
        'story_reach'
    ]
    since_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    until_date = datetime.now().strftime('%Y-%m-%d')
    results = {}
    for metric in story_metrics:
        resp = requests.get(
            f'https://graph.facebook.com/v20.0/{ig_id}/insights',
            params={
                'metric': metric,
                'period': 'day',
                'since': since_date,
                'until': until_date,
                'access_token': page_token
            },
            timeout=15
        )
        if resp.status_code == 200:
            results[metric] = resp.json()
        else:
            results[metric] = {'error': resp.text}
    return results

def analyze_media_performance(ig_id, page_token):
    media_resp = requests.get(
        f'https://graph.facebook.com/v20.0/{ig_id}/media',
        params={
            'fields': 'id,media_type,like_count,comments_count,timestamp,permalink',
            'limit': 10,
            'access_token': page_token
        },
        timeout=10
    )
    if media_resp.status_code == 200:
        media_data = media_resp.json()
        if 'data' in media_data and media_data['data']:
            total_likes = sum(media.get('like_count', 0) for media in media_data['data'])
            total_comments = sum(media.get('comments_count', 0) for media in media_data['data'])
            media_count = len(media_data['data'])
            avg_likes = total_likes / media_count if media_count > 0 else 0
            avg_comments = total_comments / media_count if media_count > 0 else 0
            return {
                'total_media_analyzed': media_count,
                'total_likes': total_likes,
                'total_comments': total_comments,
                'average_likes_per_post': round(avg_likes, 2),
                'average_comments_per_post': round(avg_comments, 2),
                'engagement_rate': round((avg_likes + avg_comments) / media_count * 100, 2) if media_count > 0 else 0,
                'media_details': media_data['data']
            }
        else:
            return {'message': 'Hiç medya bulunamadı'}
    return {'error': media_resp.text}

def get_facebook_page_and_ig_id(access_token, page_id=None):
    print(f"[DEBUG] get_facebook_page_and_ig_id: access_token={access_token[:10]}... page_id={page_id}")
    pages_resp = requests.get(
        'https://graph.facebook.com/v20.0/me/accounts',
        params={'access_token': access_token},
        timeout=10
    )
    print(f"[DEBUG] /me/accounts status={pages_resp.status_code}")
    print(f"[DEBUG] /me/accounts response: {pages_resp.text[:500]}")
    if pages_resp.status_code != 200:
        return None, None, None, {'error': 'Facebook sayfaları alınamadı', 'detail': pages_resp.text}
    pages_data = pages_resp.json()
    if 'data' not in pages_data or not pages_data['data']:
        return None, None, None, {'error': 'Kullanıcıya bağlı Facebook sayfası yok'}
    page = None
    if page_id:
        page = next((p for p in pages_data['data'] if p['id'] == page_id), None)
        print(f"[DEBUG] Selected page by page_id: {page}")
    if not page and pages_data['data']:
        page = pages_data['data'][0]
        print(f"[DEBUG] Defaulting to first page: {page}")
    if not page:
        return None, None, None, {'error': 'Uygun Facebook sayfası bulunamadı.'}
    page_id = page['id']
    page_token = page['access_token']
    ig_resp = requests.get(
        f'https://graph.facebook.com/v20.0/{page_id}',
        params={
            'fields': 'connected_instagram_account',
            'access_token': page_token
        },
        timeout=10
    )
    print(f"[DEBUG] /{page_id} status={ig_resp.status_code}")
    print(f"[DEBUG] /{page_id} response: {ig_resp.text[:500]}")
    if ig_resp.status_code != 200:
        return None, None, None, {'error': 'Instagram hesabı alınamadı', 'detail': ig_resp.text}
    ig_data = ig_resp.json()
    if 'connected_instagram_account' not in ig_data or not ig_data['connected_instagram_account']:
        return None, None, None, {'error': 'Bu Facebook sayfasına bağlı Instagram hesabı yok'}
    ig_id = ig_data['connected_instagram_account']['id']
    print(f"[DEBUG] get_facebook_page_and_ig_id: IG_ID={ig_id}, PAGE_TOKEN={page_token[:10]}..., PAGE_ID={page_id}")
    return ig_id, page_token, page_id, None

def get_demographics_data_v22(ig_id, page_token):
    """Instagram v22.0 API ile yaş, şehir, ülke, cinsiyet breakdown'larını çeker ve sadeleştirir."""
    try:
        results = {}
        breakdown_options = ['age', 'city', 'country', 'gender']
        for breakdown in breakdown_options:
            resp = requests.get(
                f'https://graph.facebook.com/v22.0/{ig_id}/insights',
                params={
                    'metric': 'follower_demographics',
                    'period': 'lifetime',
                    'metric_type': 'total_value',
                    'breakdown': breakdown,
                    'access_token': page_token
                },
                timeout=15
            )
            print(f"[DEBUG] Demographics breakdown={breakdown} status={resp.status_code}")
            try:
                print(f"[DEBUG] Demographics breakdown={breakdown} response: {resp.text[:500]}")
            except Exception:
                pass
            arr = []
            if resp.status_code == 200:
                data = resp.json()
                for row in data.get('data', []):
                    breakdowns = row.get('total_value', {}).get('breakdowns', [])
                    for b in breakdowns:
                        for result in b.get('results', []):
                            label = result.get('dimension_values', [None])[0]
                            value = result.get('value', 0)
                            arr.append({'label': label, 'value': value})
            results[breakdown] = arr
        print(f"[DEBUG] Demographics v22 parsed: {results}")
        return results
    except Exception as e:
        print(f"Demographics v22 exception: {e}")
        return {'age': [], 'city': [], 'country': [], 'gender': []}

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsInfluencer])
def instagram_full_report(request):
    access_token = request.data.get('access_token')
    page_id = request.data.get('page_id')
    print(f"[DEBUG] instagram_full_report: access_token={access_token[:10]}... page_id={page_id}")
    if not access_token:
        print("[DEBUG] HATA: access_token zorunlu.")
        return JsonResponse({'error': 'access_token zorunlu.'}, status=400)
    ig_id, page_token, page_id, err = get_facebook_page_and_ig_id(access_token, page_id)
    if err:
        print(f"[DEBUG] Facebook page/IG ID error: {err}")
        return JsonResponse(err, status=400)
    print(f"[DEBUG] IG_ID: {ig_id}, PAGE_TOKEN: {page_token[:10]}..., PAGE_ID: {page_id}")
    try:
        profile = get_extended_instagram_info(ig_id, page_token) or {}
        page_info = get_facebook_page_info(page_id, page_token) or {}
        demographics_v22 = get_demographics_data_v22(ig_id, page_token)
        print(f"[DEBUG] Final demographics_v22: {demographics_v22}")
        audience_raw = get_audience_data(ig_id, page_token)
        stories = get_story_insights(ig_id, page_token)
        media_analysis = analyze_media_performance(ig_id, page_token)
        followers_growth = get_followers_growth(audience_raw)
        post_frequency = get_post_frequency(media_analysis)
        categories = []
        if 'category_list' in page_info:
            categories = [c.get('name') for c in page_info['category_list'] if c.get('name')]
        elif 'category' in page_info:
            categories = [page_info['category']]
        location = page_info.get('location', {})
        email = ''
        if 'emails' in page_info and page_info['emails']:
            email = page_info['emails'][0]
        def get_top(arr):
            if not arr:
                return '-'
            return max(arr, key=lambda x: x['value'])['label']
        top_country = get_top(demographics_v22['country'])
        top_city = get_top(demographics_v22['city'])
        top_gender = get_top(demographics_v22['gender'])
        top_age = get_top(demographics_v22['age'])
        def parse_insight(raw, key):
            data = raw.get(key, {}).get('data', [])
            return sum(d.get('value', 0) for d in data)
        user_insights = {
            'reach': parse_insight(audience_raw, 'reach'),
            'profile_views': parse_insight(audience_raw, 'profile_views'),
            'website_clicks': parse_insight(audience_raw, 'website_clicks'),
            'follower_count': parse_insight(audience_raw, 'follower_count'),
        }
        calculated_metrics = {
            'posting_frequency': post_frequency,
            'engagement_rate': media_analysis.get('engagement_rate', 0),
            'followers_growth': followers_growth,
            'influencer_score': round((profile.get('followers_count', 0) / 1000) * media_analysis.get('engagement_rate', 0), 2) if profile.get('followers_count', 0) > 0 else 0
        }
        media_data = media_analysis
        response = {
            'profile': {
                'name': profile.get('name', ''),
                'username': profile.get('username', ''),
                'profile_picture_url': profile.get('profile_picture_url', ''),
                'biography': profile.get('biography', ''),
                'website': profile.get('website', ''),
                'followers': profile.get('followers_count', 0),
                'media': profile.get('media_count', 0),
                'location': location,
                'email': email,
            },
            'overview': {
                'categories': categories,
                'followers': profile.get('followers_count', 0),
                'followers_growth': followers_growth,
                'engagement_rate': media_analysis.get('engagement_rate', 0),
                'post_frequency': post_frequency,
            },
            'demographics': {
                'age_distribution': demographics_v22['age'],
                'city_distribution': demographics_v22['city'],
                'country_distribution': demographics_v22['country'],
                'gender_distribution': demographics_v22['gender'],
                'top_country': top_country,
                'top_city': top_city,
                'top_gender': top_gender,
                'top_age': top_age,
            },
            'user_insights': user_insights,
            'media_data': media_data,
            'calculated_metrics': calculated_metrics
        }
        print(f"[DEBUG] instagram_full_report response: {json.dumps(response, ensure_ascii=False)[:1000]}")
        return JsonResponse(response)
    except Exception as e:
        print(f"[DEBUG] instagram_full_report EXCEPTION: {e}")
        return JsonResponse({'error': f'Instagram verileri alınamadı: {str(e)}'}, status=500) 