from pathlib import Path
import re,sys
# Cost, card-wide base HP, normal damage per second, per-member render height.
rows="""
agir_zirhli 5 245 17 76
alev_muhafizi 4 210 18 72
alev_silahcisi 4 96 31 59
altin_muhafiz 5 211 19 72
arbaletci 3 80 28 58
firtina_baglayici 4 98 24 61
ates_buyucusu 5 105 34 63
ates_elementali 4 165 29 68
buz_elementali 4 155 24 67
buz_muhafizi 4 220 16 73
orman_ruhu 4 128 21 63
buz_sovalyesi 5 248 21 74
cuce_savasci 2 140 14 53
dovus_ustasi 2 85 22 56
dovus_ustasi_ii 3 117 26 61
elit_kadin_savasci 4 150 30 64
golge_avcisi 3 91 27 56
golge_buyucusu 4 96 28 61
golge_suikastci 4 102 32 56
isik_sifacisi 3 96 15 57
kar_fenercisi 2 81 12 54
iskelet_kalkanli 5 198 27 47
iskelet_savasci 1 54 15 46
kesifci 4 102 29 48
kilicli_asker 2 100 22 52
kristal_golem 7 348 26 84
lav_golemi 6 276 27 81
mavi_buyucu 3 84 25 58
muhendis_nisanci 4 90 30 60
nekromanci 5 118 24 64
ork_savasci 3 142 25 66
orman_okcu 2 66 22 52
ruh_cagirici 4 105 19 60
samuray 4 126 32 62
savas_muhendisi 5 118 32 68
tas_devi 6 304 25 83
zehirci 3 82 22 57
alize_bicakli 3 98 27 56
ayaz_kalkanlisi 3 176 15 65
bulut_dalgici 4 108 29 59
buz_zurnacisi 3 102 16 57
donuk_mizrakci 3 105 24 62
el_arabali_topcu 5 108 35 69
gece_yirticisi 5 137 26 70
kapi_ustasi 3 112 16 60
kizil_duellocu 3 108 28 59
kehribar_sovalye 4 203 19 70
kiragi_dokuyucusu 3 89 21 58
kirik_kuklaci 4 106 21 60
kirik_saat_efendisi 5 121 23 66
kok_titani 7 322 28 85
kutup_kiricisi 5 205 30 75
mantar_davulcusu 2 88 13 51
ocak_dovucusu 3 127 20 62
sedef_pervane 3 143 17 58
sicrayan_kocbasi 5 196 27 73
toprak_yarici 6 198 30 74
zincir_kiran 4 164 22 69
mage 3 85 24 59
"""
s=Path(sys.argv[1]).read_text()
ids=re.findall(r"AF285_DEFS\.(\w+)=\{\s*group:",s)
by_name={i.split('_',1)[1] if '_' in i else i:i for i in ids}
data={}
for row in rows.strip().splitlines():
 name,*vals=row.split()
 data[by_name[name]]=list(map(int,vals))
assert len(data)==len(ids)==59
def edit(a,b):
 global s
 assert s.count(a)==1,a
 s=s.replace(a,b)
table='// Base energy, total card HP, basic attack DPS and individual body height.\nconst AF288_CARDS=Object.freeze({\n'+''.join(f'  {k}: {v},\n' for k,v in data.items())+'});\n'
edit('function energyCost(type){',table+'function energyCost(type){\n  if(Object.hasOwn(AF288_CARDS,type))return AF288_CARDS[type][0];')
start=s.index('  const group=AF214_SQUADS[id]?.length||0,arch=')
end=s.index('\n}',start)
s=s[:start]+'''  const body=AF288_CARDS[id][3];
  return body/(AF320_CLASSES[cls]||AF320_CLASSES.soldier).h;'''+s[end:]
edit('stats.hp=Math.round(stats.hp*p[0]);stats.atk=Math.round(stats.atk*p[1]);\n  stats.speed*=p[2];stats.period*=p[3];','''stats.speed*=p[2];stats.period*=p[3];
  const [,hp,dps]=AF288_CARDS[id];
  stats.hp=hp;
  stats.atk=Math.max(1,Math.round(dps*stats.period));
  stats.power=stats.atk;''')
edit("cost:energyCost(c.type),cd:Math.max(0,af329.cd[c.type]","cost:af334CardCost(c.type,'enemy'),cd:Math.max(0,af329.cd[c.type]")
edit('Arena Forge Pro v3.60.287 · Karşı Hamle Dengesi','Arena Forge Pro v3.60.288 · Enerji ve Birlik Dengesi')
Path(sys.argv[2]).write_text(s)
