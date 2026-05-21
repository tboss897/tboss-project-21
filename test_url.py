import dj_database_url

try:
    url = "postgresql://postgres:B-elieve4124.@db.imoifhjnjfgofqflwdsl.supabase.co:5432/postgres"
    print(dj_database_url.parse(url))
except Exception as e:
    print("Error:", e)

try:
    url2 = "postgresql://postgres:[B-elieve4124.]@db.imoifhjnjfgofqflwdsl.supabase.co:5432/postgres"
    print(dj_database_url.parse(url2))
except Exception as e:
    print("Error 2:", e)
