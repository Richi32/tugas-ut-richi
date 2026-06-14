/**
 * app.js – Inisialisasi Vue Root Instance
 *
 * 1. Filter Global: currency, unitBuah
 * 2. Root Vue (#app): load data, routing tab, update & simpan data
 *
 * loadData() membaca dataBahanAjar.json melalui ApiService.
 */

// ===== FILTER GLOBAL =====

// Format angka → "Rp 65.000"
Vue.filter('currency', function (nilai) {
    if (nilai === null || nilai === undefined) return 'Rp 0';
    return 'Rp ' + Number(nilai).toLocaleString('id-ID');
});

// Tambah satuan → "28 buah"
Vue.filter('unitBuah', function (nilai) {
    if (nilai === null || nilai === undefined) return '-';
    return nilai + ' buah';
});

// ===== ROOT VUE INSTANCE =====
new Vue({
    el: '#app',

    data: function () {
        return {
            tab:            'stok',  // 'stok' | 'order' | 'tracking'
            loading:        true,
            errorMsg:       '',

            upbjjList:      [],
            kategoriList:   [],
            pengirimanList: [],
            paketList:      [],
            stok:           [],
            tracking:       []
        };
    },

    // created: muat data dari dataBahanAjar.json
    created: function () {
        ApiService.loadData()
            .then(function (data) {
                this.upbjjList      = data.upbjjList       || [];
                this.kategoriList   = data.kategoriList    || [];
                this.pengirimanList = data.pengirimanList  || [];
                this.paketList      = data.paket           || [];
                this.stok           = data.stok            || [];
                this.tracking       = data.tracking        || [];
                this.loading        = false;
            }.bind(this))
            .catch(function (e) {
                this.errorMsg = 'Gagal memuat data: ' + e.message;
                this.loading  = false;
            }.bind(this));
    },

    methods: {
        setTab: function (t) { this.tab = t; },

        updateStok: function (stokBaru) {
            this.stok = stokBaru;
            this._simpan();
        },

        updateTracking: function (trackingBaru) {
            this.tracking = trackingBaru;
            this._simpan();
        },

        tambahDo: function (entryDo) {
            this.tracking.push(entryDo);
            this._simpan();
            this.tab = 'tracking';  // Pindah otomatis ke tab tracking
        },

        _simpan: function () {
            ApiService.saveData({
                upbjjList:      this.upbjjList,
                kategoriList:   this.kategoriList,
                pengirimanList: this.pengirimanList,
                paket:          this.paketList,
                stok:           this.stok,
                tracking:       this.tracking
            });
        }
    }
});
