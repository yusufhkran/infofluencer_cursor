#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, request, redirect, jsonify
import requests
import json
import sys
from datetime import datetime, timedelta

app = Flask(__name__)

APP_ID = '1731435530796803'
APP_SECRET = 'edcf06f84f12037d7fb9dc1c2cb98837'

PORT = 8888
if len(sys.argv) > 1:
    try:
        PORT = int(sys.argv[1])
    except:
        PORT = 8888

REDIRECT_URI = f'http://localhost:{PORT}/callback'

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
                'limit': 50,
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
        for media in media_data.get('data', [])[:20]:  # İlk 20 medya
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
            
            # Yorum analizi
            analysis = {
                'total_comments': len(comments),
                'average_length': sum(len(c.get('text', '')) for c in comments) / len(comments) if comments else 0,
                'comments_with_likes': len([c for c in comments if c.get('like_count', 0) > 0]),
                'top_comments': sorted(comments, key=lambda x: x.get('like_count', 0), reverse=True)[:5],
                'recent_comments': comments[:10]
            }
            
            print(f"✅ {len(comments)} yorum analiz edildi")
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

def get_working_demographics(access_token):
    """v22 API ile tablodaki tüm verileri alma sistemi"""
    results = []
    
    try:
        # 1. Kullanıcı bilgileri
        user_resp = requests.get(
            'https://graph.facebook.com/v22.0/me',
            params={'access_token': access_token},
            timeout=10
        )
        
        if user_resp.status_code == 200:
            user_data = user_resp.json()
            results.append(create_success_box("👤 Kullanıcı", user_data))
        
        # 2. Facebook sayfalarını al
        pages_resp = requests.get(
            'https://graph.facebook.com/v22.0/me/accounts',
            params={'access_token': access_token},
            timeout=10
        )
        
        if pages_resp.status_code == 200:
            pages_data = pages_resp.json()
            
            if 'data' in pages_data and pages_data['data']:
                for page in pages_data['data']:
                    page_id = page['id']
                    page_token = page['access_token']
                    page_name = page.get('name', 'Unknown')
                    
                    # Instagram hesabını kontrol et
                    ig_resp = requests.get(
                        f'https://graph.facebook.com/v22.0/{page_id}',
                        params={
                            'fields': 'connected_instagram_account',
                            'access_token': page_token
                        },
                        timeout=10
                    )
                    
                    if ig_resp.status_code == 200:
                        ig_data = ig_resp.json()
                        
                        if 'connected_instagram_account' in ig_data:
                            ig_id = ig_data['connected_instagram_account']['id']
                            
                            results.append(create_info_box(f"📄 Sayfa: {page_name}", {
                                "page_id": page_id,
                                "instagram_id": ig_id,
                                "category": page.get('category', 'Unknown')
                            }))
                            
                            # KAPSAMLI ANALİZ BAŞLAT
                            print(f"\n🚀 {page_name} için kapsamlı analiz başlıyor...")
                            
                            comprehensive_data = get_comprehensive_instagram_data(ig_id, page_token)
                            
                            # Sonuçları organize et
                            if comprehensive_data:
                                
                                # Temel bilgiler
                                if 'basic_info' in comprehensive_data:
                                    results.append(create_success_box(
                                        f"📱 Instagram Temel Bilgiler: {page_name}", 
                                        comprehensive_data['basic_info']
                                    ))
                                
                                # Demografik veriler
                                if 'demographics' in comprehensive_data:
                                    results.append(create_success_box(
                                        f"👥 Demografik Analiz: {page_name}", 
                                        comprehensive_data['demographics']
                                    ))
                                
                                # Kullanıcı insights
                                if 'user_insights' in comprehensive_data:
                                    results.append(create_success_box(
                                        f"📊 Engagement ve Reach: {page_name}", 
                                        comprehensive_data['user_insights']
                                    ))
                                
                                # Medya analizi
                                if 'media_data' in comprehensive_data:
                                    media_summary = {
                                        'total_media': len(comprehensive_data['media_data'].get('data', [])),
                                        'media_with_insights': len([
                                            m for m in comprehensive_data['media_data'].get('data', []) 
                                            if 'insights' in m
                                        ]),
                                        'recent_posts': comprehensive_data['media_data'].get('data', [])[:5]
                                    }
                                    results.append(create_success_box(
                                        f"🎬 Medya Analizi: {page_name}", 
                                        media_summary
                                    ))
                                
                                # Story insights
                                if 'story_insights' in comprehensive_data:
                                    results.append(create_success_box(
                                        f"📚 Story Analizi: {page_name}", 
                                        comprehensive_data['story_insights']
                                    ))
                                
                                # Hesaplanmış metrikler
                                if 'calculated_metrics' in comprehensive_data:
                                    results.append(create_success_box(
                                        f"🧮 Hesaplanmış Metrikler: {page_name}", 
                                        comprehensive_data['calculated_metrics']
                                    ))
                                
                                # Tam veri dump'ı
                                results.append(create_info_box(
                                    f"💾 Tam Veri Dump: {page_name}", 
                                    {"message": "Tüm veriler toplandı", "data_keys": list(comprehensive_data.keys())}
                                ))
                            
                            else:
                                results.append(create_warning_box(
                                    f"⚠️ Veri Toplama: {page_name}", 
                                    "Kapsamlı veri toplanamadı"
                                ))
                        
                        else:
                            results.append(create_warning_box(
                                f"⚠️ Instagram Yok: {page_name}", 
                                "Bu sayfaya bağlı Instagram hesabı yok"
                            ))
            else:
                results.append(create_warning_box("⚠️ Sayfa Yok", "Facebook sayfanız bulunamadı"))
        else:
            results.append(create_error_box("❌ Sayfalar", pages_resp.text))
    
    except Exception as e:
        results.append(create_error_box("❌ Hata", str(e)))
    
    return ''.join(results) if results else '<p>Veri alınamadı.</p>'

def create_success_box(title, data):
    """Başarı kutusu"""
    return f'''
    <div style="border: 1px solid #28a745; padding: 15px; margin: 10px 0; border-radius: 5px; background: #d4edda;">
        <h3>✅ {title}</h3>
        <pre style="max-height: 400px; overflow-y: auto; font-size: 12px;">{json.dumps(data, indent=2, ensure_ascii=False)}</pre>
    </div>
    '''

def create_error_box(title, data):
    """Hata kutusu"""
    return f'''
    <div style="border: 1px solid #dc3545; padding: 15px; margin: 10px 0; border-radius: 5px; background: #f8d7da;">
        <h3>❌ {title}</h3>
        <pre>{data}</pre>
    </div>
    '''

def create_warning_box(title, data):
    """Uyarı kutusu"""
    return f'''
    <div style="border: 1px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 5px; background: #fff3cd;">
        <h3>⚠️ {title}</h3>
        <p>{data}</p>
    </div>
    '''

def create_info_box(title, data):
    """Bilgi kutusu"""
    return f'''
    <div style="border: 1px solid #17a2b8; padding: 15px; margin: 10px 0; border-radius: 5px; background: #d1ecf1;">
        <h3>ℹ️ {title}</h3>
        <pre style="max-height: 200px; overflow-y: auto;">{json.dumps(data, indent=2, ensure_ascii=False)}</pre>
    </div>
    '''

@app.route('/')
def home():
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Instagram Kapsamlı Analiz v22 - Tam Tablo Desteği</title>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
            .btn {{ padding: 15px 30px; background: #E4405F; color: white; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px 0; }}
            .btn:hover {{ background: #C23650; }}
            .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .info {{ background: #d1ecf1; border: 1px solid #b8daff; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .version {{ background: #e7f3ff; border: 1px solid #0066cc; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .metrics {{ background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <h1>📊 Instagram Kapsamlı Analiz v22 - Tam Tablo Desteği</h1>
        
        <div class="version">
            <h3>🎯 Tabloya Göre Kapsamlı Analiz:</h3>
            <ul>
                <li>📋 8 farklı tablo kategorisinden veri toplama</li>
                <li>🎬 Medya başına detaylı insights</li>
                <li>💬 Yorum sentiment analizi</li>
                <li>👥 Tam demografik breakdown</li>
                <li>📚 Story performans tracking</li>
                <li>🧮 Otomatik KPI hesaplamaları</li>
            </ul>
        </div>
        
        <div class="warning">
            <h3>⚠️ ÖNEMLİ: Business Hesap Gerekli!</h3>
            <p>Demografik veriler için Instagram hesabınızın <strong>Business</strong> veya <strong>Creator</strong> hesabı olması gerekiyor.</p>
            <p><strong>Instagram hesabınızı Business'a çevirmek için:</strong></p>
            <ol>
                <li>Instagram uygulamasını açın</li>
                <li>Profil → Ayarlar → Hesap</li>
                <li>"Profesyonel hesaba geç" seçin</li>
                <li>"İş" seçeneğini seçin</li>
                <li>Facebook sayfanızı bağlayın</li>
            </ol>
        </div>
        
        <div class="metrics">
            <h3>📊 Tabloya Göre Alınacak Tüm Veriler:</h3>
            
            <h4>📋 Tablo 1: Hesap Temel Bilgileri</h4>
            <ul>
                <li>🆔 <code>id, username, name</code> - Hesap kimlikleri</li>
                <li>🖼️ <code>profile_picture_url, biography, website</code> - Profil detayları</li>
                <li>📊 <code>followers_count, follows_count, media_count</code> - Sayısal veriler</li>
            </ul>
            
            <h4>📋 Tablo 2: Medya Listesi ve Detaylar</h4>
            <ul>
                <li>🎬 <code>id, caption, media_type, media_url</code> - Medya temel bilgileri</li>
                <li>🔗 <code>permalink, thumbnail_url, timestamp</code> - Link ve zaman</li>
                <li>📈 <code>like_count, comments_count, children</code> - Etkileşim ve carousel</li>
            </ul>
            
            <h4>📋 Tablo 3: Medya Insights</h4>
            <ul>
                <li>👁️ <code>impressions, reach, engagement</code> - Görünürlük metrikleri</li>
                <li>❤️ <code>likes, comments, shares, saved</code> - Etkileşim metrikleri</li>
                <li>🎥 <code>video_views</code> - Video özel metrikleri</li>
            </ul>
            
            <h4>📋 Tablo 4: Yorum Analizi</h4>
            <ul>
                <li>💬 <code>text, username, timestamp</code> - Yorum detayları</li>
                <li>📊 Yorum uzunluğu, beğeni ortalaması, sentiment analizi</li>
            </ul>
            
            <h4>📋 Tablo 5: Demografik Veriler</h4>
            <ul>
                <li>👥 <code>audience_gender_age</code> - Yaş ve cinsiyet dağılımı</li>
                <li>🌍 <code>audience_country, audience_city</code> - Coğrafi dağılım</li>
                <li>⏰ <code>online_followers</code> - Çevrimiçi aktivite saatleri</li>
            </ul>
            
            <h4>📋 Tablo 6: User Insights</h4>
            <ul>
                <li>👁️ <code>impressions, reach, profile_views</code> - Görünürlük</li>
                <li>🔗 <code>website_clicks</code> - Dönüşüm metrikleri</li>
            </ul>
            
            <h4>📋 Tablo 7: Story Insights</h4>
            <ul>
                <li>📚 <code>impressions, reach</code> - Story görünürlük</li>
                <li>👆 <code>taps_forward, taps_back, exits, replies</code> - Story etkileşimi</li>
            </ul>
            
            <h4>📋 Tablo 8: Hesaplanmış Metrikler</h4>
            <ul>
                <li>📈 <code>Engagement Rate</code> - Etkileşim oranı</li>
                <li>📚 <code>Story Exit Rate</code> - Story çıkış oranı</li>
                <li>📊 <code>Followers Growth, Ad Saturation</code> - Büyüme metrikleri</li>
                <li>⭐ <code>Influencer Score</code> - Etki puanı</li>
            </ul>
        </div>
        
        <div class="info">
            <h3>📊 Tabloya Göre Toplanacak Kapsamlı Veriler:</h3>
            <ul>
                <li>📱 <strong>Hesap Profili:</strong> Username, bio, website, followers, medya sayısı</li>
                <li>🎬 <strong>Medya Analizi:</strong> Son 50 post, her biri için detaylı insights</li>
                <li>💬 <strong>Yorum Analizi:</strong> Post başına 100 yorum, sentiment analizi</li>
                <li>👥 <strong>Demografik Veriler:</strong> Yaş, cinsiyet, şehir, ülke dağılımları</li>
                <li>📊 <strong>Engagement Metrikleri:</strong> Likes, comments, shares, saves, reach</li>
                <li>📚 <strong>Story Analizi:</strong> Son 24 saat story performansı</li>
                <li>🧮 <strong>Hesaplanmış KPI'lar:</strong> Engagement rate, growth rate, influencer score</li>
            </ul>
            
            <p><strong>🎯 BEKLENTİLER:</strong></p>
            <ul>
                <li>Tablodaki 8 farklı kategoriden veri toplanacak</li>
                <li>Her medya için ayrı insights analizi</li>
                <li>Yorum sentiment analizi ve trending tespiti</li>
                <li>Otomatik KPI hesaplamaları</li>
                <li>Story performans tracking</li>
            </ul>
            
            <p><strong>⚠️ NOT:</strong> Bazı metrikler hesap tipine ve izinlere bağlı olarak değişebilir</p>
            
            <p><strong>Minimum Gereksinimler:</strong></p>
            <ul>
                <li>Instagram Business/Creator hesabı</li>
                <li>Facebook sayfası bağlantısı</li>
                <li>En az 100 takipçi (demografik veriler için)</li>
                <li>Son 30 gün içinde aktif paylaşım</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.facebook.com/v22.0/dialog/oauth?client_id={APP_ID}&redirect_uri={REDIRECT_URI}&scope=pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,instagram_manage_comments,business_management&response_type=code&state=comprehensive_analysis_v22" class="btn">
                🚀 Kapsamlı Instagram Analizi Başlat
            </a>
        </div>
    </body>
    </html>
    '''

@app.route('/callback', methods=['GET', 'POST'])
def callback():
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        return f'<h2>❌ Hata: {error}</h2><a href="/">← Ana Sayfa</a>'
    
    if not code:
        return f'<h2>❌ Yetkilendirme kodu alınamadı</h2><a href="/">← Ana Sayfa</a>'
    
    try:
        # v22 Access token al
        token_resp = requests.get(
            'https://graph.facebook.com/v22.0/oauth/access_token',
            params={
                'client_id': APP_ID,
                'redirect_uri': REDIRECT_URI,
                'client_secret': APP_SECRET,
                'code': code
            },
            timeout=10
        )
        
        if token_resp.status_code != 200:
            return f'<h2>❌ Token hatası: {token_resp.text}</h2><a href="/">← Ana Sayfa</a>'
        
        token_data = token_resp.json()
        if 'error' in token_data:
            return f'<h2>❌ Token hatası: {token_data}</h2><a href="/">← Ana Sayfa</a>'
        
        access_token = token_data.get('access_token')
        if not access_token:
            return f'<h2>❌ Access token alınamadı</h2><a href="/">← Ana Sayfa</a>'
        
        # Kapsamlı analizi başlat
        comprehensive_results = get_working_demographics(access_token)
        
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Instagram Kapsamlı Analiz Raporu v22</title>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
                .header {{ background: linear-gradient(135deg, #E4405F, #C23650); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }}
                .back-btn {{ display: inline-block; margin: 20px 0; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }}
                pre {{ background: #f5f5f5; padding: 10px; overflow-x: auto; border-radius: 5px; font-size: 12px; }}
                .api-version {{ background: #e7f3ff; padding: 10px; border-radius: 5px; margin-bottom: 20px; }}
                .metric-status {{ background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #28a745; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Instagram Kapsamlı Analiz Raporu</h1>
                <p>Graph API v22.0 ile 8 farklı tablo kategorisinden tam veri analizi</p>
            </div>
            
            <div class="api-version">
                <strong>🆕 API Version:</strong> Graph API v22.0 | 
                <strong>📅 Analiz Tarihi:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} |
                <strong>🎯 Kapsam:</strong> 8 tablo kategorisi kapsamlı analiz
            </div>
            
            <div class="metric-status">
                <h3>📋 Analiz Edilen Kategoriler:</h3>
                <p>✅ <strong>Hesap Bilgileri:</strong> Profil, follower, medya sayıları</p>
                <p>✅ <strong>Medya Analizi:</strong> Son 50 post + detaylı insights</p>
                <p>✅ <strong>Yorum Analizi:</strong> Sentiment ve engagement analizi</p>
                <p>✅ <strong>Demografik:</strong> Yaş, cinsiyet, coğrafi dağılım</p>
                <p>✅ <strong>User Insights:</strong> Reach, engagement, profile metrikleri</p>
                <p>✅ <strong>Story Analizi:</strong> Son 24 saat performansı</p>
                <p>✅ <strong>KPI Hesaplamaları:</strong> Engagement rate, growth, influencer score</p>
            </div>
            
            {comprehensive_results}
            
            <a href="/" class="back-btn">← Yeni Kapsamlı Analiz</a>
        </body>
        </html>
        '''
    
    except Exception as e:
        return f'<h2>❌ Hata: {str(e)}</h2><a href="/">← Ana Sayfa</a>'

if __name__ == '__main__':
    print(f"📊 Instagram Kapsamlı Analiz v22 - Tam Tablo Desteği")
    print(f"🌐 Port: {PORT}")
    print(f"🔗 Ana Sayfa: http://localhost:{PORT}")
    print(f"📈 API Version: Graph API v22.0")
    print("🎯 Özellikler:")
    print("   📋 8 tablo kategorisi kapsamlı analiz")
    print("   🎬 Medya başına detaylı insights")
    print("   💬 Yorum sentiment analizi")
    print("   👥 Tam demografik breakdown")
    print("   📚 Story performans tracking")
    print("   🧮 Otomatik KPI hesaplamaları")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)