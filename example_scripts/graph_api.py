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

def get_working_demographics(access_token):
    """Çalışan demografik veri çekme sistemi"""
    results = []
    
    try:
        # 1. Kullanıcı bilgileri
        user_resp = requests.get(
            'https://graph.facebook.com/v20.0/me',
            params={'access_token': access_token},
            timeout=10
        )
        
        if user_resp.status_code == 200:
            user_data = user_resp.json()
            results.append(create_success_box("👤 Kullanıcı", user_data))
        
        # 2. Facebook sayfalarını al
        pages_resp = requests.get(
            'https://graph.facebook.com/v20.0/me/accounts',
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
                        f'https://graph.facebook.com/v20.0/{page_id}',
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
                            
                            # Instagram hesap bilgilerini al (çalışan fieldlar)
                            ig_info = get_safe_instagram_info(ig_id, page_token)
                            if ig_info:
                                results.append(create_success_box(f"📱 Instagram: {page_name}", ig_info))
                                
                                # Followers count varsa demographics dene
                                if 'followers_count' in ig_info:
                                    followers = ig_info['followers_count']
                                    
                                    if followers >= 100:  # Minimum takipçi sayısı
                                        # Demografik veriler için özel metrikler
                                        demographics = get_demographics_data(ig_id, page_token)
                                        if demographics:
                                            results.append(create_success_box(f"👥 Demografik Veriler: {page_name}", demographics))
                                        
                                        # Audience insights
                                        audience = get_audience_data(ig_id, page_token)
                                        if audience:
                                            results.append(create_success_box(f"🎯 Hedef Kitle: {page_name}", audience))
                                        
                                        # Story insights (Business hesaplar için)
                                        stories = get_story_insights(ig_id, page_token)
                                        if stories:
                                            results.append(create_success_box(f"📚 Story İstatistikleri: {page_name}", stories))
                                    else:
                                        results.append(create_warning_box(
                                            f"⚠️ Yetersiz Takipçi: {page_name}",
                                            f"Demografik veriler için en az 100 takipçi gerekli. Mevcut: {followers}"
                                        ))
                                
                                # Medya analizi
                                media_analysis = analyze_media_performance(ig_id, page_token)
                                if media_analysis:
                                    results.append(create_success_box(f"📊 Medya Analizi: {page_name}", media_analysis))
                            else:
                                results.append(create_warning_box(f"⚠️ Instagram Bilgileri: {page_name}", "Hesap bilgileri alınamadı, muhtemelen Personal hesap"))
                        else:
                            results.append(create_warning_box(f"⚠️ Instagram Yok: {page_name}", "Bu sayfaya bağlı Instagram hesabı yok"))
            else:
                results.append(create_warning_box("⚠️ Sayfa Yok", "Facebook sayfanız bulunamadı"))
        else:
            results.append(create_error_box("❌ Sayfalar", pages_resp.text))
    
    except Exception as e:
        results.append(create_error_box("❌ Hata", str(e)))
    
    return ''.join(results) if results else '<p>Veri alınamadı.</p>'

def get_safe_instagram_info(ig_id, page_token):
    """Güvenli Instagram bilgileri (çalışan fieldlar)"""
    try:
        # Debug'da çalışan fieldları kullan
        safe_fields = 'id,username,media_count,followers_count'
        
        resp = requests.get(
            f'https://graph.facebook.com/v20.0/{ig_id}',
            params={
                'fields': safe_fields,
                'access_token': page_token
            },
            timeout=10
        )
        
        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"Instagram info hatası: {resp.status_code} - {resp.text}")
            return None
    except Exception as e:
        print(f"Instagram info exception: {e}")
        return None

def get_demographics_data(ig_id, page_token):
    """Demografik veriler (Business hesaplar için)"""
    try:
        # Lifetime demographic metrics
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
                data = resp.json()
                results[metric] = data
                print(f"✅ {metric} başarılı")
            else:
                print(f"❌ {metric} hatası: {resp.status_code} - {resp.text}")
                results[metric] = f"Hata: {resp.status_code}"
        
        return results if any(isinstance(v, dict) for v in results.values()) else None
    
    except Exception as e:
        print(f"Demographics exception: {e}")
        return None

def get_audience_data(ig_id, page_token):
    """Hedef kitle verileri"""
    try:
        # Son 28 gün için audience metrics
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
                data = resp.json()
                results[metric] = data
                print(f"✅ Audience {metric} başarılı")
            else:
                print(f"❌ Audience {metric} hatası: {resp.status_code}")
                results[metric] = f"Hata: {resp.status_code}"
        
        return results if any(isinstance(v, dict) for v in results.values()) else None
    
    except Exception as e:
        print(f"Audience exception: {e}")
        return None

def get_story_insights(ig_id, page_token):
    """Story istatistikleri"""
    try:
        # Story metrics
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
                data = resp.json()
                results[metric] = data
                print(f"✅ Story {metric} başarılı")
            else:
                print(f"❌ Story {metric} hatası: {resp.status_code}")
                results[metric] = f"Hata: {resp.status_code}"
        
        return results if any(isinstance(v, dict) for v in results.values()) else None
    
    except Exception as e:
        print(f"Story exception: {e}")
        return None

def analyze_media_performance(ig_id, page_token):
    """Medya performans analizi"""
    try:
        # Son 10 medyayı al
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
                # İstatistik hesapla
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
        else:
            return None
    
    except Exception as e:
        print(f"Media analysis exception: {e}")
        return None

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
        <title>Instagram Demographics - Working Version</title>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
            .btn {{ padding: 15px 30px; background: #E4405F; color: white; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px 0; text-align: center; }}
            .btn:hover {{ background: #C23650; }}
            .btn-secondary {{ background: #6c757d; }}
            .btn-secondary:hover {{ background: #545b62; }}
            .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .info {{ background: #d1ecf1; border: 1px solid #b8daff; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .permission-info {{ background: #e2e3e5; border: 1px solid #d6d8db; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .button-container {{ text-align: center; margin: 30px 0; }}
            .button-container a {{ margin: 0 10px; }}
        </style>
    </head>
    <body>
        <h1>📊 Instagram Demographics - Çalışan Sürüm</h1>
        
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
        
        <div class="permission-info">
            <h3>🔐 İzin Yönetimi</h3>
            <p>Eğer daha önce bu uygulamaya izin verdiyseniz ve yeni izinler eklemek istiyorsanız:</p>
            <ul>
                <li><strong>"İzinleri Yeniden Ayarla"</strong> butonunu kullanın</li>
                <li>Bu size tüm izinleri tekrar gözden geçirme imkanı verir</li>
                <li>Facebook'ta verilen izinleri manuel olarak kaldırmak için: <a href="https://www.facebook.com/settings?tab=applications" target="_blank">Facebook Uygulama Ayarları</a></li>
            </ul>
        </div>
        
        <div class="info">
            <h3>📈 Bu Uygulama Size Verecekler:</h3>
            <ul>
                <li>👥 <strong>Demografik Veriler:</strong> Yaş, cinsiyet, konum dağılımı</li>
                <li>🎯 <strong>Hedef Kitle:</strong> Erişim, profil görüntüleme, web tıklamaları</li>
                <li>📊 <strong>Medya Analizi:</strong> Ortalama beğeni, yorum, etkileşim oranı</li>
                <li>📚 <strong>Story İstatistikleri:</strong> Story görüntüleme ve erişim</li>
            </ul>
            <p><strong>Minimum Gereksinimler:</strong></p>
            <ul>
                <li>Instagram Business/Creator hesabı</li>
                <li>Facebook sayfası bağlantısı</li>
                <li>En az 100 takipçi (demografik veriler için)</li>
            </ul>
        </div>
        
        <div class="button-container">
            <a href="https://www.facebook.com/v20.0/dialog/oauth?client_id={APP_ID}&redirect_uri={REDIRECT_URI}&scope=pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,instagram_manage_comments,business_management&response_type=code&state=demographics_working" class="btn">
                🚀 Demografik Analizi Başlat
            </a>
            <br>
            <a href="https://www.facebook.com/v20.0/dialog/oauth?client_id={APP_ID}&redirect_uri={REDIRECT_URI}&scope=pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,instagram_manage_comments,business_management&response_type=code&state=demographics_working&auth_type=rerequest&reauthorize=true" class="btn btn-secondary">
                🔄 İzinleri Yeniden Ayarla
            </a>
            <br>
            <a href="/force-reauth" class="btn" style="background: #dc3545;">
                🗑️ Tam Sıfırlama (İzinleri Sil)
            </a>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            <p>💡 <strong>İpucu:</strong> Eğer önceden izin verdiyseniz ve yeni izinler eklemek istiyorsanız "İzinleri Yeniden Ayarla" butonunu kullanın.</p>
        </div>
    </body>
    </html>
    '''

# İzinleri kontrol etmek için yeni route
@app.route('/permissions')
def check_permissions():
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>İzin Yönetimi</title>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
            .btn {{ padding: 15px 30px; background: #E4405F; color: white; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px; }}
            .btn:hover {{ background: #C23650; }}
            .btn-danger {{ background: #dc3545; }}
            .btn-danger:hover {{ background: #c82333; }}
            .container {{ max-width: 800px; margin: 0 auto; }}
            .info {{ background: #d1ecf1; border: 1px solid #b8daff; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔐 İzin Yönetimi</h1>
            
            <div class="info">
                <h3>📋 İzin Durumunu Kontrol Etme Seçenekleri:</h3>
                <ol>
                    <li><strong>Yeniden İzin Ver:</strong> Tüm izinleri tekrar gözden geçir</li>
                    <li><strong>İzinleri Sıfırla:</strong> Facebook'ta mevcut izinleri kaldır</li>
                    <li><strong>Manuel Kontrol:</strong> Facebook ayarlarından kontrol et</li>
                </ol>
            </div>
            
            <div style="text-align: center;">
                <a href="https://www.facebook.com/v20.0/dialog/oauth?client_id={APP_ID}&redirect_uri={REDIRECT_URI}&scope=pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,instagram_manage_comments,business_management&response_type=code&state=demographics_working&auth_type=rerequest" class="btn">
                    🔄 İzinleri Yeniden Ver
                </a>
                
                <a href="https://www.facebook.com/settings?tab=applications" target="_blank" class="btn btn-danger">
                    🗑️ Facebook'ta İzinleri Yönet
                </a>
                
                <a href="/" class="btn" style="background: #6c757d;">
                    ← Ana Sayfa
                </a>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                <h4>📝 Manuel İzin Sıfırlama:</h4>
                <p>Eğer otomatik yöntemler çalışmazsa:</p>
                <ol>
                    <li><a href="https://www.facebook.com/settings?tab=applications" target="_blank">Facebook Uygulama Ayarları</a>'na git</li>
                    <li>"Instagram Demographics" uygulamasını bul</li>
                    <li>"Kaldır" butonuna tıkla</li>
                    <li>Ana sayfaya dönüp tekrar izin ver</li>
                </ol>
            </div>
        </div>
    </body>
    </html>
    '''

# Zorla yeniden yetkilendirme için route
@app.route('/force-reauth')
def force_reauth():
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Tam İzin Sıfırlama</title>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
            .btn {{ padding: 15px 30px; background: #E4405F; color: white; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px; }}
            .btn:hover {{ background: #C23650; }}
            .btn-danger {{ background: #dc3545; }}
            .btn-danger:hover {{ background: #c82333; }}
            .container {{ max-width: 800px; margin: 0 auto; }}
            .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .steps {{ background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🗑️ Tam İzin Sıfırlama</h1>
            
            <div class="warning">
                <h3>⚠️ DİKKAT!</h3>
                <p>Facebook'ta mevcut bağlantıları tamamen silerseniz, sayfa seçim ekranını tekrar görebilirsiniz.</p>
            </div>
            
            <div class="steps">
                <h3>📋 Adım Adım İzin Sıfırlama:</h3>
                <ol>
                    <li><strong>Facebook Ayarlarına Git:</strong> 
                        <a href="https://www.facebook.com/settings?tab=applications" target="_blank" style="color: #007bff;">
                            Facebook Uygulama Ayarları
                        </a>
                    </li>
                    <li><strong>"Instagram Demographics" Uygulamasını Bul</strong></li>
                    <li><strong>"Kaldır" veya "Sil" Butonuna Tıkla</strong></li>
                    <li><strong>Onaylama Penceresinde "Evet" De</strong></li>
                    <li><strong>Bu Sayfaya Geri Dön ve Tekrar Başlat</strong></li>
                </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.facebook.com/settings?tab=applications" target="_blank" class="btn btn-danger">
                    🔗 Facebook Uygulama Ayarları
                </a>
                <br>
                <a href="/" class="btn" style="background: #6c757d;">
                    ← Ana Sayfa
                </a>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>✅ Sıfırlama Sonrası:</h4>
                <p>İzinleri sildikten sonra ana sayfadan "Demografik Analizi Başlat" butonuna tıkladığınızda:</p>
                <ul>
                    <li>Facebook login ekranı gelecek</li>
                    <li>Hangi sayfalara erişim vereceğinizi seçebileceksiniz</li>
                    <li>İstediğiniz Instagram hesaplarını seçebileceksiniz</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
    '''

@app.route('/callback', methods=['GET', 'POST'])
def callback():
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        return f'<h2>❌ Hata: {error}</h2><a href="/">← Ana Sayfa</a><br><a href="/permissions">🔧 İzin Yönetimi</a>'
    
    if not code:
        return f'<h2>❌ Yetkilendirme kodu alınamadı</h2><a href="/">← Ana Sayfa</a><br><a href="/permissions">🔧 İzin Yönetimi</a>'
    
    try:
        # Access token al
        token_resp = requests.get(
            'https://graph.facebook.com/v20.0/oauth/access_token',
            params={
                'client_id': APP_ID,
                'redirect_uri': REDIRECT_URI,
                'client_secret': APP_SECRET,
                'code': code
            },
            timeout=10
        )
        
        if token_resp.status_code != 200:
            return f'<h2>❌ Token hatası: {token_resp.text}</h2><a href="/">← Ana Sayfa</a><br><a href="/permissions">🔧 İzin Yönetimi</a>'
        
        token_data = token_resp.json()
        if 'error' in token_data:
            return f'<h2>❌ Token hatası: {token_data}</h2><a href="/">← Ana Sayfa</a><br><a href="/permissions">🔧 İzin Yönetimi</a>'
        
        access_token = token_data.get('access_token')
        if not access_token:
            return f'<h2>❌ Access token alınamadı</h2><a href="/">← Ana Sayfa</a><br><a href="/permissions">🔧 İzin Yönetimi</a>'
        
        # Demografik analizi yap
        demographics_results = get_working_demographics(access_token)
        
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Instagram Demografik Analiz Raporu</title>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
                .header {{ background: linear-gradient(135deg, #E4405F, #C23650); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }}
                .back-btn {{ display: inline-block; margin: 20px 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }}
                .permission-btn {{ background: #6c757d; }}
                pre {{ background: #f5f5f5; padding: 10px; overflow-x: auto; border-radius: 5px; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Instagram Demografik Analiz Raporu</h1>
                <p>Instagram hesaplarınızın detaylı demografik ve performans verileri</p>
            </div>
            
            {demographics_results}
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="/" class="back-btn">← Yeni Analiz</a>
                <a href="/permissions" class="back-btn permission-btn">🔧 İzin Yönetimi</a>
            </div>
        </body>
        </html>
        '''
    
    except Exception as e:
        return f'<h2>❌ Hata: {str(e)}</h2><a href="/">← Ana Sayfa</a><br><a href="/permissions">🔧 İzin Yönetimi</a>'

if __name__ == '__main__':
    print(f"📊 Instagram Demographics - Working Version")
    print(f"🌐 Port: {PORT}")
    print(f"🔗 Ana Sayfa: http://localhost:{PORT}")
    print(f"🔧 İzin Yönetimi: http://localhost:{PORT}/permissions")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)