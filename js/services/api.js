/**
 * api.js – Service data SITTA
 *
 * Membaca data awal dari dataBahanAjar.json.
 * Persistensi perubahan CRUD menggunakan localStorage.
 */
const ApiService = {
    STORAGE_KEY: 'sitta_data_v1',

    // Data default dari dataBahanAjar.json (di-embed langsung)
    _defaultData: {
        upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
        kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
        pengirimanList: [
            { kode: "REG", nama: "JNE Regular" },
            { kode: "EXP", nama: "JNE Express" }
        ],
        paket: [
            {
                kode: "PAKET-UT-001",
                nama: "PAKET IPS Dasar",
                isi: ["EKMA4116", "EKMA4115"],
                harga: 120000
            },
            {
                kode: "PAKET-UT-002",
                nama: "PAKET IPA Dasar",
                isi: ["BIOL4201", "FISIP4001"],
                harga: 140000
            }
        ],
        stok: [
            {
                kode: "EKMA4116",
                judul: "Pengantar Manajemen",
                kategori: "MK Wajib",
                upbjj: "Jakarta",
                lokasiRak: "R1-A3",
                harga: 65000,
                qty: 28,
                safety: 20,
                catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
            },
            {
                kode: "EKMA4115",
                judul: "Pengantar Akuntansi",
                kategori: "MK Wajib",
                upbjj: "Jakarta",
                lokasiRak: "R1-A4",
                harga: 60000,
                qty: 7,
                safety: 15,
                catatanHTML: "<strong>Cover baru</strong>"
            },
            {
                kode: "BIOL4201",
                judul: "Biologi Umum (Praktikum)",
                kategori: "Praktikum",
                upbjj: "Surabaya",
                lokasiRak: "R3-B2",
                harga: 80000,
                qty: 12,
                safety: 10,
                catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
            },
            {
                kode: "FISIP4001",
                judul: "Dasar-Dasar Sosiologi",
                kategori: "MK Pilihan",
                upbjj: "Makassar",
                lokasiRak: "R2-C1",
                harga: 55000,
                qty: 2,
                safety: 8,
                catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
            }
        ],
        tracking: [
            {
                "DO2025-001": {
                    nim: "123456789",
                    nama: "Rina Wulandari",
                    status: "Dalam Perjalanan",
                    ekspedisi: "JNE",
                    tanggalKirim: "25 Agustus 2025",
                    paket: "PAKET-UT-001",
                    total: 120000,
                    perjalanan: [
                        { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" }
                    ]
                }
            }
        ]
    },

    DATA_URL: 'dataBahanAjar.json',

    loadData: function () {
        var saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try { return Promise.resolve(this.normalizeData(JSON.parse(saved))); } catch (e) {
                console.warn('localStorage rusak, pakai data default.');
            }
        }

        return fetch(this.DATA_URL)
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                var normalized = ApiService.normalizeData(data);
                ApiService.saveData(normalized);
                return normalized;
            })
            .catch(function () {
                var data = JSON.parse(JSON.stringify(ApiService._defaultData));
                data = ApiService.normalizeData(data);
                ApiService.saveData(data);
                return data;
            });
    },

    saveData: function (data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.normalizeData(data)));
    },

    normalizeData: function (data) {
        data.upbjjList = data.upbjjList || [];
        data.kategoriList = data.kategoriList || [];
        data.pengirimanList = (data.pengirimanList || []).map(function (p) {
            if (p.kode === 'REG' && p.nama.indexOf('JNE') === -1) return { kode: p.kode, nama: 'JNE Regular' };
            if (p.kode === 'EXP' && p.nama.indexOf('JNE') === -1) return { kode: p.kode, nama: 'JNE Express' };
            return p;
        });
        data.paket = data.paket || [];
        data.stok = data.stok || [];
        var trackingUnik = [];
        var nomorSudahAda = {};
        (data.tracking || []).forEach(function (item) {
            var nomor = Object.keys(item)[0];
            if (!nomor || !item[nomor]) return;
            if (nomorSudahAda[nomor]) return;
            nomorSudahAda[nomor] = true;
            var detail = item[nomor];
            if (detail.ekspedisi === 'JNE') detail.ekspedisi = 'JNE Regular';
            detail.perjalanan = detail.perjalanan || [];
            detail.tanggalKirim = ApiService.formatTanggalIndo(detail.tanggalKirim);
            trackingUnik.push(item);
        });
        data.tracking = trackingUnik;
        return data;
    },

    formatTanggalIndo: function (nilai) {
        if (!nilai) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(nilai)) {
            var parts = nilai.split('-');
            var bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                         'Juli','Agustus','September','Oktober','November','Desember'];
            return Number(parts[2]) + ' ' + bulan[Number(parts[1]) - 1] + ' ' + parts[0];
        }
        return nilai;
    }
};
