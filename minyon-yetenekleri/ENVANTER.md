# 59 aktif minyon envanteri (v3.60.284 → v3.60.285)

Eski durum, yüklenen v3.60.284 dosyasında iki standart savaş sahnesinde ölçüldü (S1 saldırı, S2 destek; her biri 14 sn, gerçek kart yolu).
“çalışıyor”: kural tetiklendi, gerçek etki ve görsel sinyal görüldü. “tetiklenmedi”: bu sahnelerde koşulu oluşmadı. “yalnızca görsel”: sinyal var, ölçülen etki yok.
Eski sistemde 49 minyonun yeteneği vuruş/hasar/zamanlayıcı tetiklemeli pasif kuraldı (AF267), 10 minyonunki özel pasifti (AF264).
Hiçbirinde birimin kendisi hazırlık hareketi yapmıyor, yetenek bir durum olarak yaşanmıyor, görsel yalnız küçük bir üst katman efektiydi.

| # | Grup | Minyon | ID | Nadirlik | Enerji | Eski yetenek | Eski durum (ölçüm) | Not | Yeni özel yetenek | Yeni durum |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | Ağır Zırhlı | `af37_agir_zirhli` | Efsanevi | 7 | Çelik Ön Saf | çalışıyor |  | Çelik Siper (eklendi) | ✔ test geçti |
| 2 | 1 | Alev Bekçisi | `af37_alev_muhafizi` | Epik | 5 | Köz Zırhı | çalışıyor |  | Köz Zırhı (dönüştürüldü) | ✔ test geçti |
| 3 | 1 | Alev Silahçısı | `af37_alev_silahcisi` | Epik | 4 | Köz Yelpazesi | çalışıyor |  | Köz Yelpazesi (dönüştürüldü) | ✔ test geçti |
| 4 | 1 | Altın Muhafız | `af37_altin_muhafiz` | Efsanevi | 6 | Altın Nöbet | yalnızca görsel | Bozuk: hazırlık sinyali çıkıyor ama dost hazırlık sırasında menzilden çıkınca kalkan uygulanmıyordu. | Altın Nöbet (dönüştürüldü) | ✔ test geçti |
| 5 | 1 | Arbaletçi | `af37_arbaletci` | Sıradan | 3 | Çifte Nişan | çalışıyor |  | Çifte Nişan (dönüştürüldü) | ✔ test geçti |
| 6 | 2 | Ateş Büyücüsü | `af37_ates_buyucusu` | Epik | 5 | Kor Çemberi | çalışıyor |  | Kor Çemberi (dönüştürüldü) | ✔ test geçti |
| 7 | 2 | Ateş Elementali | `af37_ates_elementali` | Efsanevi | 5 | Kül Yağmuru | çalışıyor |  | Alev Dalgası (eklendi) | ✔ test geçti |
| 8 | 2 | Buz Elementali | `af37_buz_elementali` | Efsanevi | 5 | Kırılgan Buz | tetiklenmedi | Koşullu (yavaşlamış hedef gerekir); testte tetiklenmedi. | Kırılgan Buz (dönüştürüldü) | ✔ test geçti |
| 9 | 2 | Buz Muhafızı | `af37_buz_muhafizi` | Nadir | 4 | Ayak Kesme | çalışıyor |  | Buz Siperi (dönüştürüldü) | ✔ test geçti |
| 10 | 3 | Buz Şövalyesi | `af37_buz_sovalyesi` | Efsanevi | 6 | Kar Hattı | çalışıyor |  | Kar Hattı (dönüştürüldü) | ✔ test geçti |
| 11 | 3 | Cüce Savaşçı | `af37_cuce_savasci` | Sıradan | 3 | Kısa Çekiç | çalışıyor |  | Kısa Çekiç (dönüştürüldü) | ✔ test geçti |
| 12 | 3 | Dövüş Ustası | `af37_dovus_ustasi` | Sıradan | 3 | Asa Karşılığı | çalışıyor |  | Asa Karşılığı (dönüştürüldü) | ✔ test geçti |
| 13 | 3 | Mızrak Ustası | `af37_dovus_ustasi_ii` | Nadir | 3 | İkinci Basış | çalışıyor |  | İkinci Basış (dönüştürüldü) | ✔ test geçti |
| 14 | 4 | Elit Kadın Savaşçı | `af37_elit_kadin_savasci` | Nadir | 4 | Orak Geçidi | çalışıyor |  | Orak Geçidi (dönüştürüldü) | ✔ test geçti |
| 15 | 4 | Gölge Avcı | `af37_golge_avcisi` | Epik | 4 | Yaranın Peşinde | çalışıyor |  | Yaranın Peşinde (dönüştürüldü) | ✔ test geçti |
| 16 | 4 | Gece Büyücüsü | `af37_golge_buyucusu` | Epik | 5 | Kesilen Soluk | çalışıyor |  | Kesilen Soluk (dönüştürüldü) | ✔ test geçti |
| 17 | 4 | Gölge Suikastçı | `af37_golge_suikastci` | Epik | 3 | Gölge Pususu | yalnızca görsel | Görünmezlik çalışıyor; pusu hasarı saldırı içinde hesaplanıyor (bu ölçümün dışında). | Gölge Kesiği (eklendi) | ✔ test geçti |
| 18 | 4 | Işık Şifacısı | `af37_isik_sifacisi` | Nadir | 4 | İlk Işık | çalışıyor |  | İlk Işık (dönüştürüldü) | ✔ test geçti |
| 19 | 5 | İskelet Kalkanlı | `af37_iskelet_kalkanli` | Sıradan | 3 | Kemik Duvarı | çalışıyor |  | Kemik Duvarı (dönüştürüldü) | ✔ test geçti |
| 20 | 5 | İskelet Savaşçı | `af37_iskelet_savasci` | Sıradan | 2 | Son Kemik | çalışıyor |  | Son Kemik (dönüştürüldü) | ✔ test geçti |
| 21 | 5 | Keşifçi | `af37_kesifci` | Sıradan | 2 | İz Oku | çalışıyor |  | İz Oku (dönüştürüldü) | ✔ test geçti |
| 22 | 5 | Kılıçlı Asker | `af37_kilicli_asker` | Sıradan | 2 | Yan Yana | çalışıyor |  | Yan Yana (dönüştürüldü) | ✔ test geçti |
| 23 | 10 | Kızıl Düellocu | `af37_kizil_duellocu` | Sıradan | 3 | Düello İmzası | çalışıyor |  | — | sırada |
| 24 | 6 | Kristal Golem | `af37_kristal_golem` | Efsanevi | 7 | Kristal Karşı Siper | yalnızca görsel | Yalnız yetenek hasarı aldığında kalkan verir; sinyal görüldü, kalkan ölçümde kaynağa bağlanamadı. | — | sırada |
| 25 | 6 | Lav Golemi | `af37_lav_golemi` | Efsanevi | 7 | Lav Kuyruğu | çalışıyor |  | — | sırada |
| 26 | 6 | Mavi Büyücü | `af37_mavi_buyucu` | Epik | 4 | İkiz Kıvılcım | çalışıyor |  | — | sırada |
| 27 | 6 | Mühendis Nişancı | `af37_muhendis_nisanci` | Epik | 4 | Zırh Delici Kurşun | çalışıyor |  | — | sırada |
| 28 | 6 | Nekromancı | `af37_nekromanci` | Efsanevi | 5 | Ruh Payı | tetiklenmedi | Koşullu: son vuruş + yakında yaralı dost gerekir; test sahnesinde oluşmadı. | — | sırada |
| 29 | 7 | Ork Savaşçı | `af37_ork_savasci` | Nadir | 4 | Omuz Darbesi | çalışıyor |  | — | sırada |
| 30 | 7 | Orman Okçusu | `af37_orman_okcu` | Sıradan | 1 | Yavaşlatan Ok | çalışıyor |  | — | sırada |
| 31 | 3 | Orman Ruhu | `af37_orman_ruhu` | Epik | 5 | Taze Filiz | çalışıyor |  | Taze Filiz (dönüştürüldü) | ✔ test geçti |
| 32 | 7 | Ruh Çağırıcı | `af37_ruh_cagirici` | Efsanevi | 4 | Ruh Yankısı | çalışıyor |  | — | sırada |
| 33 | 7 | Samuray | `af37_samuray` | Nadir | 4 | Denge Kesimi | çalışıyor |  | — | sırada |
| 34 | 7 | Savaş Mühendisi | `af37_savas_muhendisi` | Efsanevi | 6 | Yer Sarsan Mermi | çalışıyor |  | — | sırada |
| 35 | 8 | Taş Devi | `af37_tas_devi` | Efsanevi | 7 | Sabit Kaya | çalışıyor |  | — | sırada |
| 36 | 8 | Zehirci | `af37_zehirci` | Efsanevi | 4 | Yoğun Zehir | çalışıyor |  | — | sırada |
| 37 | 8 | Alize Bıçaklı | `afn_alize_bicakli` | Sıradan | 3 | Rüzgâr Aralığı | çalışıyor |  | — | sırada |
| 38 | 8 | Ayaz Kalkanlısı | `afn_ayaz_kalkanlisi` | Epik | 4 | Ayaz Kalkanı | çalışıyor |  | — | sırada |
| 39 | 8 | Bulut Dalgıcı | `afn_bulut_dalgici` | Nadir | 3 | Bulut Perdesi | çalışıyor |  | — | sırada |
| 40 | 9 | Buz Zurnacısı | `afn_buz_zurnacisi` | Epik | 4 | Soğuk Nefes | çalışıyor |  | — | sırada |
| 41 | 9 | Donuk Mızrakçı | `afn_donuk_mizrakci` | Sıradan | 3 | Hat Dikişi | çalışıyor |  | — | sırada |
| 42 | 9 | El Arabalı Topçu | `afn_el_arabali_topcu` | Sıradan | 2 | Topçu Mermisi | çalışıyor |  | — | sırada |
| 43 | 2 | Fırtına Bağlayıcı | `afn_firtina_baglayici` | Mitik | 3 | Zincir Yıldırım | çalışıyor |  | Zincir Yıldırım (dönüştürüldü) | ✔ test geçti |
| 44 | 9 | Gece Yırtıcısı | `afn_gece_yirticisi` | Nadir | 3 | Gece Açlığı | çalışıyor |  | — | sırada |
| 45 | 9 | Kapı Ustası | `afn_kapi_ustasi` | Nadir | 3 | Kapı Tamiri | çalışıyor |  | — | sırada |
| 46 | 5 | Kar Fenercisi | `afn_kar_fenercisi` | Nadir | 3 | Kar Feneri | çalışıyor |  | Kar Feneri (dönüştürüldü) | ✔ test geçti |
| 47 | 10 | Kehribar Şövalye | `afn_kehribar_sovalye` | Nadir | 3 | Kehribar Kardeşliği | tetiklenmedi | Koşullu: yalnız yanında dost varken önden gelen yakın vuruşta çalışır; test sahnesinde koşul oluşmadı. | — | sırada |
| 48 | 10 | Kırağı Dokuyucusu | `afn_kiragi_dokuyucusu` | Epik | 4 | Kırağı Düğümü | çalışıyor |  | — | sırada |
| 49 | 10 | Kırık Kuklacı | `afn_kirik_kuklaci` | Epik | 4 | Kırık İp | çalışıyor |  | — | sırada |
| 50 | 10 | Kırık Saat Efendisi | `afn_kirik_saat_efendisi` | Mitik | 4 | Geri Kalan Saniye | çalışıyor |  | — | sırada |
| 51 | 11 | Kök Titanı | `afn_kok_titani` | Mitik | 7 | Kök Salma | çalışıyor |  | — | sırada |
| 52 | 11 | Kutup Kırıcısı | `afn_kutup_kiricisi` | Epik | 5 | Kutup Çatlağı | çalışıyor |  | — | sırada |
| 53 | 11 | Mantar Davulcusu | `afn_mantar_davulcusu` | Sıradan | 2 | Yürüyüş Davulu | çalışıyor |  | — | sırada |
| 54 | 11 | Ocak Dövücüsü | `afn_ocak_dovucusu` | Sıradan | 3 | Ocak Alevi | çalışıyor |  | — | sırada |
| 55 | 11 | Sedef Pervane | `afn_sedef_pervane` | Nadir | 3 | Sedef Sapması | çalışıyor |  | — | sırada |
| 56 | 12 | Sıçrayan Koçbaşı | `afn_sicrayan_kocbasi` | Epik | 5 | Kuşatma Sekişi | tetiklenmedi | Koşullu: heykel/engel hedefinde ve portal önceliğinde çalışır; test sahnesinde koşul oluşmadı. | — | sırada |
| 57 | 12 | Toprak Yarıcı | `afn_toprak_yarici` | Mitik | 6 | Yeraltı Geçidi | yalnızca görsel | Tünel çalışıyor; çıkıştaki alan hasarı yalnız çıkış noktasında düşman varsa uygulanıyor, testte boşa düştü. | — | sırada |
| 58 | 12 | Zincir Kıran | `afn_zincir_kiran` | Epik | 5 | Bağ Koparan | çalışıyor |  | — | sırada |
| 59 | 12 | Büyücü | `mage` | Nadir | 3 | Mühür Çatlağı | çalışıyor |  | — | sırada |
