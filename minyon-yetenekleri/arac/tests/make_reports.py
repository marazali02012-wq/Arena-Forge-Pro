#!/usr/bin/env python3
"""Depo için ilerleme, envanter ve grup raporlarını üretir.
Kullanım: make_reports.py ÇIKTI_KLASÖRÜ (minyon-yetenekleri/)"""
import sys, json, pathlib, io, shutil
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
BUILD = ROOT / 'build'
OUT = pathlib.Path(sys.argv[1])

ORDER = ["af37_agir_zirhli", "af37_alev_muhafizi", "af37_alev_silahcisi", "af37_altin_muhafiz", "af37_arbaletci", "af37_ates_buyucusu",
         "af37_ates_elementali", "af37_buz_elementali", "af37_buz_muhafizi", "af37_buz_sovalyesi", "af37_cuce_savasci", "af37_dovus_ustasi",
         "af37_dovus_ustasi_ii", "af37_elit_kadin_savasci", "af37_golge_avcisi", "af37_golge_buyucusu", "af37_golge_suikastci",
         "af37_isik_sifacisi", "af37_iskelet_kalkanli", "af37_iskelet_savasci", "af37_kesifci", "af37_kilicli_asker", "af37_kizil_duellocu",
         "af37_kristal_golem", "af37_lav_golemi", "af37_mavi_buyucu", "af37_muhendis_nisanci", "af37_nekromanci", "af37_ork_savasci",
         "af37_orman_okcu", "af37_orman_ruhu", "af37_ruh_cagirici", "af37_samuray", "af37_savas_muhendisi", "af37_tas_devi", "af37_zehirci",
         "afn_alize_bicakli", "afn_ayaz_kalkanlisi", "afn_bulut_dalgici", "afn_buz_zurnacisi", "afn_donuk_mizrakci", "afn_el_arabali_topcu",
         "afn_firtina_baglayici", "afn_gece_yirticisi", "afn_kapi_ustasi", "afn_kar_fenercisi", "afn_kehribar_sovalye", "afn_kiragi_dokuyucusu",
         "afn_kirik_kuklaci", "afn_kirik_saat_efendisi", "afn_kok_titani", "afn_kutup_kiricisi", "afn_mantar_davulcusu", "afn_ocak_dovucusu",
         "afn_sedef_pervane", "afn_sicrayan_kocbasi", "afn_toprak_yarici", "afn_zincir_kiran", "mage"]
# Grup sırası (kullanıcının gönderdiği görseller nedeniyle Fırtına Bağlayıcı 2., Orman Ruhu 3. gruba alındı).
GROUPS = {
    1: ["af37_agir_zirhli", "af37_alev_muhafizi", "af37_alev_silahcisi", "af37_altin_muhafiz", "af37_arbaletci"],
    2: ["afn_firtina_baglayici", "af37_ates_buyucusu", "af37_ates_elementali", "af37_buz_elementali", "af37_buz_muhafizi"],
    3: ["af37_orman_ruhu", "af37_buz_sovalyesi", "af37_cuce_savasci", "af37_dovus_ustasi", "af37_dovus_ustasi_ii"],
    4: ["af37_elit_kadin_savasci", "af37_golge_avcisi", "af37_golge_buyucusu", "af37_golge_suikastci", "af37_isik_sifacisi"],
    5: ["af37_iskelet_kalkanli", "af37_iskelet_savasci", "af37_kesifci", "af37_kilicli_asker", "af37_kizil_duellocu"],
    6: ["af37_kristal_golem", "af37_lav_golemi", "af37_mavi_buyucu", "af37_muhendis_nisanci", "af37_nekromanci"],
    7: ["af37_ork_savasci", "af37_orman_okcu", "af37_ruh_cagirici", "af37_samuray", "af37_savas_muhendisi"],
    8: ["af37_tas_devi", "af37_zehirci", "afn_alize_bicakli", "afn_ayaz_kalkanlisi", "afn_bulut_dalgici"],
    9: ["afn_buz_zurnacisi", "afn_donuk_mizrakci", "afn_el_arabali_topcu", "afn_gece_yirticisi", "afn_kapi_ustasi"],
    10: ["afn_kar_fenercisi", "afn_kehribar_sovalye", "afn_kiragi_dokuyucusu", "afn_kirik_kuklaci", "afn_kirik_saat_efendisi"],
    11: ["afn_kok_titani", "afn_kutup_kiricisi", "afn_mantar_davulcusu", "afn_ocak_dovucusu", "afn_sedef_pervane"],
    12: ["afn_sicrayan_kocbasi", "afn_toprak_yarici", "afn_zincir_kiran", "mage"],
}
assert sorted(sum(GROUPS.values(), [])) == sorted(ORDER) and len(ORDER) == 59
# Elle yapılan kod incelemesi notları (standart sahnede tetiklenmeyen ya da ölçüm dışı kalan eski yetenekler).
NOTES = {
    'afn_kehribar_sovalye': 'Koşullu: yalnız yanında dost varken önden gelen yakın vuruşta çalışır; test sahnesinde koşul oluşmadı.',
    'afn_sicrayan_kocbasi': 'Koşullu: heykel/engel hedefinde ve portal önceliğinde çalışır; test sahnesinde koşul oluşmadı.',
    'afn_toprak_yarici': 'Tünel çalışıyor; çıkıştaki alan hasarı yalnız çıkış noktasında düşman varsa uygulanıyor, testte boşa düştü.',
    'af37_golge_suikastci': 'Görünmezlik çalışıyor; pusu hasarı saldırı içinde hesaplanıyor (bu ölçümün dışında).',
    'af37_nekromanci': 'Koşullu: son vuruş + yakında yaralı dost gerekir; test sahnesinde oluşmadı.',
    'af37_kristal_golem': 'Yalnız yetenek hasarı aldığında kalkan verir; sinyal görüldü, kalkan ölçümde kaynağa bağlanamadı.',
    'af37_buz_elementali': 'Koşullu (yavaşlamış hedef gerekir); testte tetiklenmedi.',
    'af37_altin_muhafiz': 'Bozuk: hazırlık sinyali çıkıyor ama dost hazırlık sırasında menzilden çıkınca kalkan uygulanmıyordu.',
}


def webp(src, dst, width=640):
    im = Image.open(src).convert('RGB')
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=72, method=6)


def group_report(n, defs, inventory):
    rp = BUILD / f'group{n}' / 'report.json'
    if not rp.exists():
        return None
    r = json.loads(rp.read_text(encoding='utf-8'))
    gdir = OUT / 'test-sonuclari' / f'grup{n}'
    gdir.mkdir(parents=True, exist_ok=True)
    shutil.copy(rp, gdir / 'report.json')
    for png in sorted((BUILD / f'group{n}').glob('*.png')):
        webp(png, gdir / (png.stem + '.webp'))
    cols = ['kart', 'tetik', 'hedef', 'hesap', 'zamanlama', 'poz', 'bekleme', 'yenihedef', 'kesinti', 'grup', 'pvp']
    head = {'kart': 'Kart oynama', 'tetik': 'Tetiklenme', 'hedef': 'Doğru hedef', 'hesap': 'Hesap/durum', 'zamanlama': 'Animasyonla eş zaman',
            'poz': 'Hazırlık pozu', 'bekleme': 'Bekleme süresi', 'yenihedef': 'Ölüm/yeni hedef', 'kesinti': 'Kesinti', 'grup': 'Grup etkileşimi', 'pvp': 'PvP eşitleme'}
    L = [f'# Grup {n} test raporu', '', 'Gerçek savaş döngüsü, kartlar gerçek oynama yolundan. ✔ geçti, ✘ kaldı.', '',
         '| Minyon | Yetenek | ' + ' | '.join(head[c] for c in cols) + ' |', '|' + '---|' * (len(cols) + 2)]
    for t in GROUPS[n]:
        m = r['minions'].get(t)
        d = defs.get(t, {})
        name = (inventory.get(t, {}).get('info') or {}).get('name', t)
        if not m or 'checks' not in m:
            L.append(f'| {name} | {d.get("name","?")} | ' + ' | '.join('–' for _ in cols) + ' |')
            continue
        L.append(f'| {name} | {d.get("name","?")} | ' + ' | '.join('✔' if m['checks'].get(c) else '✘' for c in cols) + ' |')
    L += ['', '## Ayrıntılar', '']
    for t in GROUPS[n]:
        m = r['minions'].get(t)
        if not m or 'checks' not in m:
            continue
        name = (inventory.get(t, {}).get('info') or {}).get('name', t)
        tm, ca, cd, pv = m.get('timing', {}), m.get('calc', {}), m.get('cooldown', {}), m.get('pvp', {})
        hits = ca.get('hits') or []
        dm = ', '.join(f"{h['pre']:.1f}→{h['dealt']}" for h in hits if h.get('dealt') is not None)
        L += [f'### {name} · {defs.get(t,{}).get("name","")}',
              f'- Kart: {m["card"]["spent"]} enerji harcandı (bedel {m["card"]["cost"]}), {m["card"]["spawned"]} birlik çıktı.',
              f'- Zamanlama: hazırlık {tm.get("wind_at")} sn, etki {tm.get("impact_at")} sn (beklenen {tm.get("expected")} sn).',
              f'- Hedef: planlanan #{m["targets"]["planned"]}, etkilenen {m["targets"]["hit"]}, yanlış takıma etki {m["targets"]["wrongTeam"]}.',
              f'- Hesap: saldırı {ca.get("atk")}; ham→uygulanan hasar: {dm or "—"}; durumlar: {", ".join(ca.get("statuses", [])) or "—"}.',
              f'- Bekleme: ikinci kullanım {cd.get("gap")} sn sonra (bekleme {cd.get("cd")} sn).',
              f'- Ölüm/yeni hedef: {m["retarget"].get("result", m["retarget"].get("why"))}; kesinti: hazırlıkta sersemletilince iptal={m["interrupt"].get("cancelled")}, sonra yeniden kullanıldı={m["interrupt"].get("reusedAfter")}; birim hazırlıkta ölünce etki yok={not m["casterDeath"].get("impact")}.',
              f'- PvP: ikinci sayfa (seat 2) yeteneği gördü={pv.get("peerSawCast")}, efektler={pv.get("peerFx")}, can eşit={pv.get("hpSync")}, kendi başına benzetim={pv.get("peerSimulatedAbilities")}.',
              f'- Görüntüler: `{t}_1_hazirlik.webp`, `{t}_2_kullanim.webp`, `{t}_3_etki.webp`, `{t}_3b_sonra.webp`, `{t}_4_pvp_seat2.webp`.', '']
        if m.get('notes'):
            L.append('- Not: ' + '; '.join(m['notes']))
            L.append('')
    (gdir / 'rapor.md').write_text('\n'.join(L), encoding='utf-8')
    return {t: (r['minions'].get(t) or {}).get('passed') for t in GROUPS[n]}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    inventory = json.loads((BUILD / 'inventory_orig.json').read_text(encoding='utf-8'))
    system = json.loads((BUILD / 'system.json').read_text(encoding='utf-8')) if (BUILD / 'system.json').exists() else {}
    defs = {d['id']: d for d in system.get('abilities', [])}
    results = {}
    for n in GROUPS:
        res = group_report(n, defs, inventory)
        if res:
            results[n] = res
    # ENVANTER
    L = ['# 59 aktif minyon envanteri (v3.60.284 → v3.60.285)', '',
         'Eski durum, yüklenen v3.60.284 dosyasında iki standart savaş sahnesinde ölçüldü (S1 saldırı, S2 destek; her biri 14 sn, gerçek kart yolu).',
         '“çalışıyor”: kural tetiklendi, gerçek etki ve görsel sinyal görüldü. “tetiklenmedi”: bu sahnelerde koşulu oluşmadı. “yalnızca görsel”: sinyal var, ölçülen etki yok.',
         'Eski sistemde 49 minyonun yeteneği vuruş/hasar/zamanlayıcı tetiklemeli pasif kuraldı (AF267), 10 minyonunki özel pasifti (AF264).',
         'Hiçbirinde birimin kendisi hazırlık hareketi yapmıyor, yetenek bir durum olarak yaşanmıyor, görsel yalnız küçük bir üst katman efektiydi.', '',
         '| # | Grup | Minyon | ID | Nadirlik | Enerji | Eski yetenek | Eski durum (ölçüm) | Not | Yeni özel yetenek | Yeni durum |', '|---|---|---|---|---|---|---|---|---|---|---|']
    gof = {t: n for n, ts in GROUPS.items() for t in ts}
    for i, t in enumerate(ORDER, 1):
        rec = inventory.get(t, {})
        info = rec.get('info') or {}
        old = (rec.get('rule') or {}).get('n') or ''
        if not old and info.get('ability'):
            old = info['ability'].split(':')[0]
        d = defs.get(t)
        passed = results.get(gof[t], {}).get(t)
        new_state = ('✔ test geçti' if passed else ('✘ test kaldı' if passed is False else 'kodlandı, test bekliyor')) if d else 'sırada'
        L.append(f"| {i} | {gof[t]} | {info.get('name', t)} | `{t}` | {info.get('rarity','')} | {rec.get('cost','')} | {old} | {rec.get('status','')} | {NOTES.get(t,'')} | {(d['name'] + ' (' + d['status'] + ')') if d else '—'} | {new_state} |")
    (OUT / 'ENVANTER.md').write_text('\n'.join(L) + '\n', encoding='utf-8')
    # İLERLEME
    done = [n for n in GROUPS if n in results and all(results[n].values())]
    nxt = next((n for n in GROUPS if n not in done), None)
    prog = {'surum': '3.60.285', 'oyun_dosyasi': 'ArenaForgePro_v3_60_285_Minyon_Yetenek_TEST.html',
            'temel_dosya': 'ArenaForgePro_v3_60_284_Minyon_Gelistirme_TEST.html (build.py --strip ile geri üretilir)',
            'grup_sirasi': GROUPS, 'tamamlanan_gruplar': done, 'siradaki_grup': nxt,
            'minyonlar': {t: {'grup': gof[t], 'yetenek': defs[t]['name'] if t in defs else None, 'durum': defs[t]['status'] if t in defs else 'sırada',
                              'test': ('geçti' if results.get(gof[t], {}).get(t) else 'kaldı') if t in defs and gof[t] in results else None} for t in ORDER},
            'sistem_denetimi': system.get('unchanged'),
            'gorsel_eslestirme': {
                'dome_gold / dome_blue (kalkan kubbesi, 16 kare)': 'af37_altin_muhafiz (altın), af37_buz_muhafizi (mavi); sıradaki kalkanlı yetenekler: afn_ayaz_kalkanlisi, afn_kapi_ustasi, af37_iskelet_kalkanli',
                'chain_lightning (zincir yıldırım, 16 kare)': 'afn_firtina_baglayici',
                'vine_heal (sarmaşık şifası, 16 kare)': 'af37_orman_ruhu',
                'fx_fire_shield': 'af37_alev_muhafizi', 'fx_storm_bind': 'afn_firtina_baglayici (bağlama anı)', 'fx_ice_slash': 'af37_buz_sovalyesi',
                'fx_holy_light': 'af37_isik_sifacisi (grup 4)', 'fx_shadow_strike': 'af37_golge_suikastci (grup 4)', 'fx_poison_flask': 'af37_zehirci (grup 8)',
                'fx_vines12': 'afn_kok_titani (grup 11)', 'fx_earth_burst': 'afn_toprak_yarici (grup 12)', 'fx_chains': 'afn_zincir_kiran (grup 12)',
                'fx_dome12': 'yedek mavi kubbe (12 kare)'}}
    (OUT / 'ILERLEME.json').write_text(json.dumps(prog, ensure_ascii=False, indent=1), encoding='utf-8')
    print('tamamlanan', done, 'sıradaki', nxt)


if __name__ == '__main__':
    main()
