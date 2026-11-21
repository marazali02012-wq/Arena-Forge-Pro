# Grup sahneleri. Her minyon için: dost/düşman yerleşimi ve beklenen yetenek davranışı.
#   kind     : 'offense' (düşmana etki) | 'support' (dosta etki)
#   coef     : yetenek hasar katsayıları (u.atk ile çarpılır), sırayla vuruş başına
#   maxTargets / statuses : doğrulanacak üst sınır ve durumlar
#   hurt     : sahne başında yaralanacak dost birlikler (destek yetenekleri için)
GROUPS = {
  1: {
    'af37_agir_zirhli': {
      'ally': [('af37_agir_zirhli', 1, .30), ('af37_orman_okcu', 1, .20)],
      'enemy': [('af37_kilicli_asker', 1, .52), ('af37_iskelet_savasci', 1, .60)],
      'kind': 'offense', 'coef': [.55], 'maxTargets': 3, 'statuses': ['push', 'delay'], 'selfDr': .40, 'allyDr': .22,
      'wave2': [('af37_ork_savasci', 1, .56), ('af37_samuray', 1, .62)],
    },
    'af37_alev_muhafizi': {
      'ally': [('af37_alev_muhafizi', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .50), ('af37_iskelet_savasci', 1, .58)],
      'kind': 'offense', 'coef': [.35], 'maxTargets': 4, 'statuses': ['dot'],
    },
    'af37_alev_silahcisi': {
      'ally': [('af37_alev_silahcisi', 1, .24), ('af37_agir_zirhli', 1, .34)],
      'enemy': [('af37_iskelet_savasci', 1, .56), ('af37_kilicli_asker', 1, .64)],
      'kind': 'offense', 'coef': [.45], 'maxTargets': 3, 'statuses': ['dot'],
    },
    'af37_altin_muhafiz': {
      'ally': [('af37_altin_muhafiz', 1, .28), ('af37_orman_okcu', 1, .12)],
      'enemy': [('af37_ork_savasci', 1, .52), ('af37_samuray', 1, .58)],
      'hurt': [('af37_orman_okcu', .5)],
      'kind': 'support', 'coef': [], 'maxTargets': 4, 'statuses': ['shield'], 'dome': 1,
    },
    'af37_arbaletci': {
      'ally': [('af37_arbaletci', 1, .24), ('af37_agir_zirhli', 1, .33)],
      'enemy': [('af37_kilicli_asker', 1, .55), ('af37_iskelet_savasci', 1, .62)],
      'kind': 'offense', 'coef': [.85, .70], 'maxTargets': 2, 'statuses': ['push', 'delay'],
    },
  },
  2: {
    'afn_firtina_baglayici': {
      'ally': [('afn_firtina_baglayici', 1, .24), ('af37_agir_zirhli', 1, .34)],
      'enemy': [('af37_iskelet_savasci', 1, .56), ('af37_kilicli_asker', 1, .62)],
      'kind': 'offense', 'coef': [1.30, .90, .60, .40], 'maxTargets': 4, 'statuses': ['root'], 'window': .8,
    },
    'af37_ates_buyucusu': {
      'ally': [('af37_ates_buyucusu', 1, .24), ('af37_iskelet_kalkanli', 1, .34)],
      'enemy': [('af37_ork_savasci', 1, .54), ('af37_iskelet_savasci', 1, .58), ('af37_kilicli_asker', 1, .64)],
      'kind': 'offense', 'coef': [.55, .45], 'maxTargets': 4, 'statuses': ['dot'], 'window': 1.0,
    },
    'af37_ates_elementali': {
      'ally': [('af37_ates_elementali', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .50), ('af37_iskelet_savasci', 1, .58)],
      'kind': 'offense', 'coef': [.50], 'maxTargets': 3, 'statuses': ['dot', 'push'],
      'wave2': [('af37_ork_savasci', 1, .56), ('af37_kilicli_asker', 1, .62)],
    },
    'af37_buz_elementali': {
      'ally': [('af37_buz_elementali', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .50), ('af37_iskelet_savasci', 1, .58)],
      'kind': 'offense', 'coef': [.40, .60], 'maxTargets': 3, 'statuses': ['slow'],
      'wave2': [('af37_ork_savasci', 1, .56), ('af37_kilicli_asker', 1, .62)],
    },
    'af37_buz_muhafizi': {
      'ally': [('af37_buz_muhafizi', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .50), ('af37_iskelet_savasci', 1, .58)],
      'kind': 'offense', 'coef': [.55], 'maxTargets': 4, 'statuses': ['root', 'shield'], 'selfDome': 2,
      'wave2': [('af37_ork_savasci', 1, .56), ('af37_kilicli_asker', 1, .62)],
    },
  },
  3: {
    'af37_orman_ruhu': {
      'ally': [('af37_orman_ruhu', 1, .08), ('af37_agir_zirhli', 1, .14)],
      'enemy': [('af37_ork_savasci', 1, .54), ('af37_samuray', 1, .60)],
      'hurt': [('af37_agir_zirhli', .55)],
      'kind': 'support', 'coef': [], 'maxTargets': 1, 'statuses': ['heal'], 'vine': True,
    },
    'af37_buz_sovalyesi': {
      'ally': [('af37_buz_sovalyesi', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .50), ('af37_iskelet_savasci', 1, .56)],
      'kind': 'offense', 'coef': [.40], 'maxTargets': 3, 'statuses': ['slow'],
      'wave2': [('af37_ork_savasci', 1, .56), ('af37_kilicli_asker', 1, .62)],
    },
    'af37_cuce_savasci': {
      'ally': [('af37_cuce_savasci', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .50), ('af37_iskelet_savasci', 1, .56)],
      'kind': 'offense', 'coef': [.70], 'maxTargets': 1, 'statuses': ['stun'],
      'wave2': [('af37_ork_savasci', 1, .56), ('af37_samuray', 1, .62)],
    },
    'af37_dovus_ustasi': {
      'ally': [('af37_dovus_ustasi', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .50)],
      'kind': 'offense', 'coef': [.90], 'maxTargets': 1, 'statuses': ['push', 'delay'],
      'wave2': [('af37_kilicli_asker', 1, .56)],
    },
    'af37_dovus_ustasi_ii': {
      'ally': [('af37_dovus_ustasi_ii', 1, .30)],
      'enemy': [('af37_iskelet_savasci', 1, .52), ('af37_kilicli_asker', 1, .58)],
      'kind': 'offense', 'coef': [.75], 'maxTargets': 2, 'statuses': ['push'],
      'wave2': [('af37_iskelet_savasci', 1, .56)],
    },
  },
  4: {
    'af37_elit_kadin_savasci': {
      'ally': [('af37_elit_kadin_savasci', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .50), ('af37_iskelet_savasci', 1, .56)],
      'kind': 'offense', 'coef': [.65], 'maxTargets': 3, 'statuses': ['push'],
      'wave2': [('af37_kilicli_asker', 1, .56)],
    },
    'af37_golge_avcisi': {
      'ally': [('af37_golge_avcisi', 1, .30)],
      'enemy': [('af37_orman_okcu', 1, .52)],
      'kind': 'offense', 'coef': [1.10, 1.76], 'maxTargets': 1, 'statuses': [],
      'wave2': [('af37_kilicli_asker', 1, .56)],
    },
    'af37_golge_buyucusu': {
      'ally': [('af37_golge_buyucusu', 1, .22), ('af37_iskelet_kalkanli', 1, .30)],
      'enemy': [('af37_ork_savasci', 1, .54), ('af37_kilicli_asker', 1, .60)],
      'kind': 'offense', 'coef': [.70], 'maxTargets': 1, 'statuses': ['timed'],
    },
    'af37_golge_suikastci': {
      'ally': [('af37_golge_suikastci', 1, .30)],
      'enemy': [('af37_kilicli_asker', 1, .52), ('af37_orman_okcu', 1, .62)],
      'kind': 'offense', 'coef': [1.2, 1.5], 'maxTargets': 1, 'statuses': [],
      'wave2': [('af37_kilicli_asker', 1, .54), ('af37_orman_okcu', 1, .62)],
    },
    'af37_isik_sifacisi': {
      'ally': [('af37_isik_sifacisi', 1, .08), ('af37_agir_zirhli', 1, .14)],
      'enemy': [('af37_ork_savasci', 1, .54), ('af37_samuray', 1, .60)],
      'hurt': [('af37_agir_zirhli', .55)],
      'kind': 'support', 'coef': [], 'maxTargets': 3, 'statuses': ['heal'],
    },
  },
}
# Yan etki denetimi için: yeteneği değiştirilmeyen bir minyonun eski kuralı hâlâ çalışmalı.
# İlk dönüştürülmemiş aday kullanılır (yeteneği henüz değiştirilmemiş kartın eski kuralı aynen çalışmalı).
CONTROL_CANDIDATES = ['af37_ork_savasci', 'af37_samuray', 'af37_kilicli_asker', 'af37_dovus_ustasi', 'afn_donuk_mizrakci']
def control_for(converted):
    for t in CONTROL_CANDIDATES:
        if t not in converted:
            return {'type': t, 'ally': [(t, 1, .30), ('af37_agir_zirhli', 1, .22)],
                    'enemy': [('af37_kilicli_asker', 1, .52), ('af37_iskelet_savasci', 1, .60)]}
    return None
CONTROL = control_for(set())
