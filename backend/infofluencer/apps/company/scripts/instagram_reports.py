#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Instagram Graph API v22.0 ile kapsamlı analiz modülü
Django projesi için uyarlanmış versiyon
"""

import requests
import json
from datetime import datetime, timedelta
from django.conf import settings
from apps.company.models import InstagramToken
from apps.accounts.models import CompanyProfile
from django.utils import timezone


def get_comprehensive_instagram_data(ig_id, page_token):
    """Tablodaki tüm verileri almak için kapsamlı Instagram analizi"""
    results = {}
    
    try:
        print("🚀 Kapsamlı analiz başlıyor...")
        
        # 1. HESAP TEMEL BİLGİLERİ
        basic_info = get_instagram_basic_info(ig_id, page_token)
        if basic_info:
            results['basic_info'] = basic_info
        
        # 2. MEDYA LİSTESİ VE DETAYLARI
        media_data = get_media_comprehensive(ig_id, page_token)
        if media_data:
            results['media_data'] = media_data
        
        # 3. DEMOGRAFİK VERİLER
        demographics = get_demographics_comprehensive(ig_id, page_token)
        if demographics:
            results['demographics'] = demographics
        
        # 4. ENGAGEMENT VE REACH METRİKLERİ
        insights = get_user_insights_comprehensive(ig_id, page_token)
        if insights:
            results['user_insights'] = insights
        
        # 5. STORY ANALİZLERİ
        story_insights = get_story_insights(ig_id, page_token)
        if story_insights:
            results['story_insights'] = story_insights
        
        # 6. HESAPLANMIŞ METRİKLER
        calculated_metrics = calculate_advanced_metrics(results)
        if calculated_metrics:
            results['calculated_metrics'] = calculated_metrics
        
        print(f"✅ Kapsamlı analiz tamamlandı. {len(results)} kategori toplandı.")
        return results
    
    except Exception as e:
        print(f"Comprehensive data exception: {e}")
        return results


def get_instagram_basic_info(ig_id, page_token):
    """Hesap temel bilgileri - Tablo 1'deki veriler"""
    try:
        # Genişletilmiş fields
        fields = [
            'id', 'username', 'name', 'profile_picture_url', 'biography',
            'website', 'followers_count', 'follows_count', 'media_count'
        ]
        
        resp = requests.get(
            f'https://graph.facebook.com/v22.0/{ig_id}',
            params={
                'fields': ','.join(fields),
                'access_token': page_token
            },
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            print("✅ Hesap temel bilgileri alındı")
            return data
        else:
            print(f"❌ Hesap bilgileri hatası: {resp.status_code}")
            return None
    
    except Exception as e:
        print(f"Basic info exception: {e}")
        return None


def get_media_comprehensive(ig_id, page_token):
    """Medya listesi ve detaylı insights - Tablo 2-4'teki veriler"""
    try:
        # Önce medya listesini al
        media_resp = requests.get(
            f'https://graph.facebook.com/v22.0/{ig_id}/media',
            params={
                'fields': 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children,like_count,comments_count',
                'limit': 5,
                'access_token': page_token
            },
            timeout=15
        )
        
        if media_resp.status_code != 200:
            print(f"❌ Medya listesi hatası: {media_resp.status_code}")
            return None
        
        media_data = media_resp.json()
        print(f"✅ {len(media_data.get('data', []))} medya bulundu")
        
        # Her medya için detaylı insights al
        for media in media_data.get('data', [])[:5]:  # Son 5 medya
            media_id = media['id']
            media_type = media.get('media_type', 'UNKNOWN')
            
            # Medya insights - Tablo 3'teki metrikler
            media_insights = get_media_insights_detailed(media_id, media_type, page_token)
            if media_insights:
                media['insights'] = media_insights
            
            # Comments ve text analysis - Tablo 4 için
            if media.get('comments_count', 0) > 0:
                comments_data = get_media_comments(media_id, page_token)
                if comments_data:
                    media['comments_analysis'] = comments_data
        
        return media_data
    
    except Exception as e:
        print(f"Media comprehensive exception: {e}")
        return None


def get_media_insights_detailed(media_id, media_type, page_token):
    """Detaylı medya insights - Tablo 3"""
    try:
        # Medya tipine göre metrikler
        if media_type == 'IMAGE':
            metrics = ['impressions', 'reach', 'engagement', 'saved', 'likes', 'comments', 'shares']
        elif media_type == 'VIDEO':
            metrics = ['impressions', 'reach', 'engagement', 'saved', 'likes', 'comments', 'shares', 'video_views']
        elif media_type == 'CAROUSEL_ALBUM':
            metrics = ['impressions', 'reach', 'engagement', 'saved', 'likes', 'comments', 'shares']
        else:
            metrics = ['impressions', 'reach', 'engagement']
        
        results = {}
        
        # Her metriği tek tek dene
        for metric in metrics:
            try:
                resp = requests.get(
                    f'https://graph.facebook.com/v22.0/{media_id}/insights',
                    params={
                        'metric': metric,
                        'access_token': page_token
                    },
                    timeout=10
                )
                
                if resp.status_code == 200:
                    data = resp.json()
                    results[metric] = data
                    print(f"✅ Media insight {metric} başarılı")
                else:
                    print(f"❌ Media insight {metric} hatası: {resp.status_code}")
            
            except Exception as e:
                print(f"Media insight {metric} exception: {e}")
        
        return results if results else None
    
    except Exception as e:
        print(f"Media insights detailed exception: {e}")
        return None


def get_media_comments(media_id, page_token):
    """Medya yorumları analizi - Tablo 4"""
    try:
        resp = requests.get(
            f'https://graph.facebook.com/v22.0/{media_id}/comments',
            params={
                'fields': 'text,username,timestamp,like_count,replies',
                'limit': 100,
                'access_token': page_token
            },
            timeout=10
        )
        
        if resp.status_code == 200:
            comments_data = resp.json()
            comments = comments_data.get('data', [])
            
            # Yorum metinlerini çıkar
            comment_texts = []
            for comment in comments:
                text = comment.get('text', '').strip()
                if text:  # Boş olmayan yorumları ekle
                    comment_texts.append({
                        'text': text,
                        'username': comment.get('username', ''),
                        'timestamp': comment.get('timestamp', ''),
                        'like_count': comment.get('like_count', 0)
                    })
            
            # Yorum analizi
            analysis = {
                'total_comments': len(comments),
                'total_text_comments': len(comment_texts),
                'average_length': sum(len(c.get('text', '')) for c in comments) / len(comments) if comments else 0,
                'comments_with_likes': len([c for c in comments if c.get('like_count', 0) > 0]),
                'top_comments': sorted(comments, key=lambda x: x.get('like_count', 0), reverse=True)[:5],
                'recent_comments': comments[:10],
                'comment_texts': comment_texts,  # Yorum metinleri
                'all_texts': [c['text'] for c in comment_texts]  # Sadece metinler
            }
            
            print(f"✅ {len(comments)} yorum analiz edildi, {len(comment_texts)} metin çıkarıldı")
            return analysis
        else:
            print(f"❌ Yorumlar hatası: {resp.status_code}")
            return None
    
    except Exception as e:
        print(f"Comments exception: {e}")
        return None


def get_demographics_comprehensive(ig_id, page_token):
    """Kapsamlı demografik veriler - Tablo 5"""
    try:
        results = {}
        
        # Çalışan demografik metrikler
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
            
            if resp.status_code == 200:
                data = resp.json()
                results[f'follower_demographics_{breakdown}'] = data
                print(f"✅ Demografik {breakdown} başarılı")
        
        # Online followers - çevrimiçi saatler
        resp = requests.get(
            f'https://graph.facebook.com/v22.0/{ig_id}/insights',
            params={
                'metric': 'online_followers',
                'period': 'lifetime',
                'access_token': page_token
            },
            timeout=15
        )
        
        if resp.status_code == 200:
            data = resp.json()
            results['online_followers'] = data
            print("✅ Çevrimiçi takipçi saatleri alındı")
        
        return results
    
    except Exception as e:
        print(f"Demographics comprehensive exception: {e}")
        return None


def get_user_insights_comprehensive(ig_id, page_token):
    """Kapsamlı kullanıcı insights - Tablo 6"""
    try:
        # Son 28 gün için
        since_date = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
        until_date = datetime.now().strftime('%Y-%m-%d')
        
        # Çalışan metrikler (önceki testlerden)
        working_metrics = [
            'reach', 'follower_count', 'accounts_engaged', 'total_interactions',
            'likes', 'comments', 'shares', 'saves', 'follows_and_unfollows',
            'profile_links_taps'
        ]
        
        # Test edilecek ek metrikler
        additional_metrics = [
            'impressions', 'profile_views', 'website_clicks', 'email_contacts',
            'phone_call_clicks', 'text_message_clicks', 'get_directions_clicks'
        ]
        
        results = {}
        
        # Çalışan metrikleri al
        for metric in working_metrics:
            try:
                resp = requests.get(
                    f'https://graph.facebook.com/v22.0/{ig_id}/insights',
                    params={
                        'metric': metric,
                        'period': 'day',
                        'since': since_date,
                        'until': until_date,
                        'metric_type': 'total_value',
                        'access_token': page_token
                    },
                    timeout=15
                )
                
                if resp.status_code == 200:
                    data = resp.json()
                    results[metric] = data
                    print(f"✅ User insight {metric} başarılı")
            
            except Exception as e:
                print(f"User insight {metric} exception: {e}")
        
        # Ek metrikleri test et
        for metric in additional_metrics:
            try:
                resp = requests.get(
                    f'https://graph.facebook.com/v22.0/{ig_id}/insights',
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
                    data = resp.json()
                    results[metric] = data
                    print(f"🆕 Ek metrik {metric} başarılı!")
                else:
                    print(f"❌ Ek metrik {metric} hatası: {resp.status_code}")
            
            except Exception as e:
                print(f"Ek metrik {metric} exception: {e}")
        
        return results
    
    except Exception as e:
        print(f"User insights comprehensive exception: {e}")
        return None


def get_story_insights(ig_id, page_token):
    """Story insights - Tablo 7"""
    try:
        # Son 24 saat için story'leri al
        since_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        until_date = datetime.now().strftime('%Y-%m-%d')
        
        # Story medyalarını al
        resp = requests.get(
            f'https://graph.facebook.com/v22.0/{ig_id}/media',
            params={
                'fields': 'id,media_type,timestamp',
                'since': since_date,
                'until': until_date,
                'access_token': page_token
            },
            timeout=10
        )
        
        if resp.status_code != 200:
            print(f"❌ Story listesi hatası: {resp.status_code}")
            return None
        
        media_data = resp.json()
        stories = [m for m in media_data.get('data', []) if m.get('media_type') == 'STORY']
        
        if not stories:
            print("ℹ️ Aktif story bulunamadı")
            return None
        
        story_insights = []
        
        # Her story için insights
        for story in stories:
            story_id = story['id']
            
            # Story metrikleri
            story_metrics = ['impressions', 'reach', 'taps_forward', 'taps_back', 'exits', 'replies']
            
            insights = {}
            for metric in story_metrics:
                try:
                    resp = requests.get(
                        f'https://graph.facebook.com/v22.0/{story_id}/insights',
                        params={
                            'metric': metric,
                            'access_token': page_token
                        },
                        timeout=10
                    )
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        insights[metric] = data
                
                except Exception as e:
                    print(f"Story insight {metric} exception: {e}")
            
            if insights:
                story_insights.append({
                    'story_id': story_id,
                    'timestamp': story['timestamp'],
                    'insights': insights
                })
        
        print(f"✅ {len(story_insights)} story analiz edildi")
        return story_insights
    
    except Exception as e:
        print(f"Story insights exception: {e}")
        return None


def calculate_advanced_metrics(results):
    """Tablo 8'deki hesaplanmış metrikler"""
    try:
        calculated = {}
        
        # Temel veriler
        basic_info = results.get('basic_info', {})
        user_insights = results.get('user_insights', {})
        media_data = results.get('media_data', {})
        
        followers_count = basic_info.get('followers_count', 1)
        
        # Engagement Rate hesapla
        if 'total_interactions' in user_insights and 'reach' in user_insights:
            total_interactions_data = user_insights['total_interactions'].get('data', [])
            reach_data = user_insights['reach'].get('data', [])
            
            if total_interactions_data and reach_data:
                total_interactions = sum(d.get('value', 0) for d in total_interactions_data)
                total_reach = sum(d.get('value', 0) for d in reach_data)
                
                if total_reach > 0:
                    calculated['engagement_rate'] = (total_interactions / total_reach) * 100
        
        # Story Exit Rate
        story_insights = results.get('story_insights', [])
        if story_insights:
            total_impressions = 0
            total_exits = 0
            
            for story in story_insights:
                insights = story.get('insights', {})
                if 'impressions' in insights and 'exits' in insights:
                    impressions_data = insights['impressions'].get('data', [])
                    exits_data = insights['exits'].get('data', [])
                    
                    if impressions_data:
                        total_impressions += impressions_data[0].get('value', 0)
                    if exits_data:
                        total_exits += exits_data[0].get('value', 0)
            
            if total_impressions > 0:
                calculated['story_exit_rate'] = (total_exits / total_impressions) * 100
        
        # Followers Growth Rate
        if 'follower_count' in user_insights:
            follower_data = user_insights['follower_count'].get('data', [])
            if len(follower_data) > 1:
                oldest = follower_data[-1].get('value', 0)
                newest = follower_data[0].get('value', 0)
                
                if oldest > 0:
                    calculated['followers_growth_rate'] = ((newest - oldest) / oldest) * 100
        
        # Ad Saturation (posting frequency)
        if media_data and 'data' in media_data:
            medias = media_data['data']
            if len(medias) > 1:
                # Son 30 günde kaç post
                thirty_days_ago = datetime.now() - timedelta(days=30)
                recent_posts = []
                for m in medias:
                    try:
                        post_time = datetime.fromisoformat(m.get('timestamp', '').replace('Z', '+00:00')).replace(tzinfo=None)
                        if post_time > thirty_days_ago:
                            recent_posts.append(m)
                    except:
                        continue
                calculated['posting_frequency'] = len(recent_posts) / 30  # Günlük ortalama
        
        # Influencer Score (basit hesaplama)
        if followers_count > 0 and 'engagement_rate' in calculated:
            # Basit skor: (followers/1000) * engagement_rate
            calculated['influencer_score'] = (followers_count / 1000) * calculated['engagement_rate']
        
        print(f"✅ {len(calculated)} hesaplanmış metrik oluşturuldu")
        return calculated
    
    except Exception as e:
        print(f"Calculate metrics exception: {e}")
        return None


def get_instagram_analytics_for_company(company_profile):
    """Bir şirket için Instagram analizini çalıştırır"""
    try:
        # Instagram token'ını al
        token = InstagramToken.objects.filter(company=company_profile).first()
        if not token:
            return {"error": "Instagram token bulunamadı"}
        
        # Token süresi dolmuşsa otomatik yenile
        if token.token_expiry and token.token_expiry <= timezone.now():
            # Token'ı yenile
            resp = requests.get(
                "https://graph.instagram.com/refresh_access_token",
                params={
                    "grant_type": "ig_refresh_token",
                    "access_token": token.access_token
                },
                timeout=10
            )
            print("INSTAGRAM REFRESH TOKEN RESPONSE (auto):", resp.status_code, resp.text)
            if resp.status_code == 200:
                data = resp.json()
                token.access_token = data.get("access_token", token.access_token)
                expires_in = data.get("expires_in", 3600)
                token.token_expiry = timezone.now() + timezone.timedelta(seconds=expires_in)
                token.save()
                # Token yenilendi bilgisini response'a ekle
                token_was_refreshed = True
            else:
                return {"error": "Instagram token süresi dolmuş ve yenileme başarısız", "details": resp.text}
        else:
            token_was_refreshed = False
        
        # Instagram business account ID'sini kontrol et
        if not token.instagram_business_account_id:
            return {"error": "Instagram business account ID bulunamadı"}
        
        # Kapsamlı analizi çalıştır
        comprehensive_data = get_comprehensive_instagram_data(
            token.instagram_business_account_id, 
            token.access_token
        )
        
        # Son güncelleme zamanını kaydet
        token.last_data_fetch = timezone.now()
        token.save()
        
        # Eğer token yenilendiyse, response'a ekle
        if token_was_refreshed:
            comprehensive_data['details'] = 'token yenilendi'
        return comprehensive_data
    
    except Exception as e:
        print(f"Instagram analytics error: {e}")
        return {"error": str(e)} 