-- ŞABLON — canlı Supabase'de YETKİLİ KİŞİ tarafından, mevcut şemaya bakılarak uyarlanıp çalıştırılmalıdır.
-- (Bu depoda mevcut `afp_social_me`, `afp_leaderboard`, `player_profiles` tanımları bulunmadığı için burada ÇALIŞTIRILIP
--  DOĞRULANMADI; 01 ve 02 dosyaları ise yerelde doğrulandı.)
-- Amaç: istemcinin gönderdiği kupanın artık hiçbir yerde GERÇEK kupa sayılmaması.

-- 1) afp_social_me: p_trophies parametresini YOK SAY (imza uyumluluğu için parametre kalsın, gövdede kullanma).
--    Örnek: update ... set trophies = <satırı sunucu kupasından al>, DEĞİL coalesce(p_trophies, trophies)
--    Sunucu kupası = (select trophies from public.afp_player_trophies where user_id = auth.uid())

-- 2) afp_leaderboard: kupa kaynağı olarak afp_player_trophies kullan (dünya sıralaması için afp_trophy_leaderboard hazır).
--    Arkadaş sıralaması: arkadaş kimliklerini mevcut arkadaşlık tablosundan al, kupaları afp_player_trophies'ten oku.

-- 3) İSTEMCİNİN doğrudan yazabileceği tüm kupa alanlarını kapat:
--    a) Profil tablosunda kupa sütunu varsa istemci rollerinin yazma yetkisini sütun düzeyinde kaldır:
--         revoke update (trophies) on public.player_profiles from anon, authenticated;   -- sütun varsa
--         revoke insert (trophies) on public.player_profiles from anon, authenticated;
--    b) save_data (bulut yedek) JSON'u içindeki 'trophies' değerini sıralama/eşleşme için ASLA okuma.
--    c) Eşleşme (WSS) sunucusu kupayı hello mesajından değil afp_player_trophies'ten (service_role) okur.

-- 4) Doğrulama sorguları (yetkili rol ile): anon/authenticated için
--      select has_table_privilege('authenticated','public.afp_player_trophies','UPDATE');   -- false olmalı
--      select has_function_privilege('authenticated','public.afp_trophy_settle(text,uuid,uuid,boolean,timestamptz,timestamptz)','EXECUTE'); -- false
