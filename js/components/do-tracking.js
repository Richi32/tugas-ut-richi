/**
 * do-tracking.js – Komponen <ba-do-tracking>
 * Template: #tpl-do-tracking (di index.html)
 *
 * Fitur Vue:
 * - computed : hasilCari (reaktif dari queryAktif)
 * - watch    : trackingList (sync dari parent), localTracking (emit ke parent)
 * - @keyup.enter : submit pencarian
 * - @keyup.esc   : reset pencarian
 */
Vue.component('ba-do-tracking', {
    template: '#tpl-do-tracking',

    props: {
        trackingList: { type: Array, required: true },
        paketList:    { type: Array, required: true }
    },

    data: function () {
        return {
            localTracking:  [],
            sedangSinkronProp: false,
            query:          '',
            queryAktif:     '',
            sudahCari:      false,
            inputProgress:  {},
            errProgress:    {}
        };
    },

    watch: {
        // Watcher 1: Sync prop → localTracking saat parent update
        trackingList: {
            handler: function (baru) {
                this.sedangSinkronProp = true;
                this.localTracking = JSON.parse(JSON.stringify(baru));
                this.$nextTick(function () {
                    this.sedangSinkronProp = false;
                });
            },
            immediate: true
        },

        // Watcher 2: Emit ke parent setiap localTracking berubah
        localTracking: {
            handler: function (baru) {
                if (this.sedangSinkronProp) return;
                this.$emit('update-tracking', baru);
            },
            deep: true
        }
    },

    computed: {
        hasilCari: function () {
            var q = this.queryAktif.trim().toLowerCase();
            if (!q) return [];
            var hasil = [];
            this.localTracking.forEach(function (item) {
                var nomor = Object.keys(item)[0];
                var data  = item[nomor];
                if (nomor.toLowerCase().includes(q) || String(data.nim).toLowerCase().includes(q)) {
                    hasil.push({ nomorDo: nomor, data: data });
                }
            });
            return hasil;
        }
    },

    methods: {
        cari: function () {
            this.queryAktif = this.query;
            this.sudahCari  = true;
        },

        resetCari: function () {
            this.query = ''; this.queryAktif = ''; this.sudahCari = false;
            this.inputProgress = {}; this.errProgress = {};
        },

        getInfoPaket: function (kode) {
            return this.paketList.find(function (p) { return p.kode === kode; }) || null;
        },

        tambahProgress: function (nomorDo) {
            var ket = (this.inputProgress[nomorDo] || '').trim();
            Vue.set(this.errProgress, nomorDo, '');
            if (!ket) { Vue.set(this.errProgress, nomorDo, 'Keterangan tidak boleh kosong.'); return; }

            var idx = this.localTracking.findIndex(function (item) { return Object.keys(item)[0] === nomorDo; });
            if (idx > -1) {
                var salinan = JSON.parse(JSON.stringify(this.localTracking[idx]));
                var data    = salinan[nomorDo];
                var p = function (n) { return String(n).padStart(2,'0'); };
                var d = new Date();
                var waktu = d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())
                            +' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());

                data.perjalanan.push({ waktu: waktu, keterangan: ket });
                if (ket.toLowerCase().includes('terima') || ket.toLowerCase().includes('sampai')) {
                    data.status = 'Diterima';
                } else {
                    data.status = 'Dalam Perjalanan';
                }
                Vue.set(this.localTracking, idx, salinan);
            }
            Vue.set(this.inputProgress, nomorDo, '');
        }
    }
});
