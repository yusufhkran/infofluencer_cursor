"""
Ortak kullanılan yardımcı fonksiyonlar (helpers) burada bulunur.
"""


def camel_to_snake(name):
    import re

    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


def is_known(val):
    """
    'unknown', 'not set', boş gibi değerleri filtreler.
    """
    v = (val or "").strip().lower()
    return v not in ["unknown", "bilinmiyor", "bilinmeyen", "", "(not set)", "not set"]


def refresh_ga4_token(ga4_token):
    # ... orijinal fonksiyon içeriği ...
    pass


def percent_distribution(raw_list, value_key):
    """
    Bir listedeki value_key toplamına göre yüzde dağılımı hesaplar.
    """
    total = sum(x[value_key] for x in raw_list) or 1
    return [
        {**row, value_key: round(100 * row[value_key] / total, 1)} for row in raw_list
    ]


def top_n(items, key, n=5):
    """
    Bir listedeki en yüksek n elemanı döner.
    """
    return sorted(items, key=lambda x: x[key], reverse=True)[:n]
