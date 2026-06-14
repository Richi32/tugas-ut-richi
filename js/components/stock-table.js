/**
 * stock-table.js – Komponen <ba-stock-table>
 * Template: #tpl-stock-table (di index.html)
 *
 * Fitur Vue:
 * - computed : stokTerfilter (filter + sort, tidak recompute jika deps tidak berubah)
 * - watch    : filterUpbjj (dependent filter), localStok (sinkron ke parent)
 * - v-if/v-else-if/v-else, v-show, v-for, v-model, v-bind, v-html
 * - @keyup.enter untuk simpan via keyboard
 * - Vue.filter 'currency' dan 'unitBuah' didefinisikan global di app.js
 */
Vue.component('ba-stock-table', {
    template: '#tpl-stock-table',

    props: {
        stok:         { type: Array, required: true },
        upbjjList:    { type: Array, required: true },
        kategoriList: { type: Array, required: true }
    },

    data: function () {
        return {
            localStok: [],
            sedangSinkronProp: false,

            // Filter state
            filterUpbjj:    '',
            filterKategori: '',
            filterLowStock: false,

            // Sort state
            sortBy:    'judul',
            sortOrder: 'asc',

            // Modal visibility
            showModalTambah: false,
            showModalEdit:   false,
            showModalHapus:  false,

            // Form tambah
            form: { kode:'', judul:'', kategori:'', upbjj:'', lokasiRak:'', harga:0, qty:0, safety:0, catatanHTML:'' },
            err:  { kode:'', judul:'', kategori:'', upbjj:'', lokasiRak:'', harga:'', qty:'', safety:'' },

            // Form edit
            formEdit:  null,
            editIndex: -1,
            errEdit:   { judul:'', kategori:'', upbjj:'', lokasiRak:'', harga:'', qty:'', safety:'' },

            // Hapus
            itemHapus:  null,
            hapusIndex: -1
        };
    },

    watch: {
        // Watcher 1: Reset filterKategori saat filterUpbjj berubah (dependent filter)
        filterUpbjj: function (baru) {
            if (!baru) this.filterKategori = '';
        },

        // Watcher 2: Emit update ke parent setiap localStok berubah (deep watch)
        localStok: {
            handler: function (baru) {
                if (this.sedangSinkronProp) return;
                this.$emit('update-stok', baru);
            },
            deep: true,
            immediate: false
        },

        // Sync prop → localStok saat pertama load
        stok: {
            handler: function (baru) {
                this.sedangSinkronProp = true;
                this.localStok = JSON.parse(JSON.stringify(baru));
                this.$nextTick(function () {
                    this.sedangSinkronProp = false;
                });
            },
            immediate: true
        }
    },

    computed: {
        // Computed property: filter + sort dalam satu langkah
        // Vue hanya re-evaluasi jika salah satu dependency berubah
        stokTerfilter: function () {
            var hasil = this.localStok.slice();

            if (this.filterUpbjj) {
                hasil = hasil.filter(function (s) { return s.upbjj === this.filterUpbjj; }, this);
            }
            if (this.filterUpbjj && this.filterKategori) {
                hasil = hasil.filter(function (s) { return s.kategori === this.filterKategori; }, this);
            }
            if (this.filterLowStock) {
                hasil = hasil.filter(function (s) { return s.qty < s.safety || s.qty === 0; });
            }

            var key = this.sortBy;
            var order = this.sortOrder;
            hasil.sort(function (a, b) {
                var x = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
                var y = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
                if (x < y) return order === 'asc' ? -1 : 1;
                if (x > y) return order === 'asc' ? 1 : -1;
                return 0;
            });

            return hasil;
        }
    },

    methods: {
        resetFilter: function () {
            this.filterUpbjj = ''; this.filterKategori = '';
            this.filterLowStock = false;
            this.sortBy = 'judul'; this.sortOrder = 'asc';
        },

        // --- Tambah ---
        bukaModalTambah: function () {
            this.form = { kode:'', judul:'', kategori:'', upbjj:'', lokasiRak:'', harga:0, qty:0, safety:0, catatanHTML:'' };
            this._resetErr(this.err);
            this.showModalTambah = true;
        },
        tutupModalTambah: function () { this.showModalTambah = false; },
        simpanTambah: function () {
            if (!this._validasi(this.form, this.err, true)) return;
            this.localStok.push({
                kode: this.form.kode.trim().toUpperCase(),
                judul: this.form.judul.trim(),
                kategori: this.form.kategori,
                upbjj: this.form.upbjj,
                lokasiRak: this.form.lokasiRak.trim(),
                harga: Number(this.form.harga),
                qty: Number(this.form.qty),
                safety: Number(this.form.safety),
                catatanHTML: this.form.catatanHTML.trim()
            });
            this.tutupModalTambah();
        },

        // --- Edit ---
        bukaModalEdit: function (item) {
            this.editIndex = this.localStok.findIndex(function (s) { return s.kode === item.kode; });
            this.formEdit = JSON.parse(JSON.stringify(item));
            this._resetErr(this.errEdit);
            this.showModalEdit = true;
        },
        tutupModalEdit: function () { this.showModalEdit = false; this.formEdit = null; this.editIndex = -1; },
        simpanEdit: function () {
            if (!this._validasi(this.formEdit, this.errEdit, false)) return;
            Vue.set(this.localStok, this.editIndex, {
                kode: this.formEdit.kode,
                judul: this.formEdit.judul.trim(),
                kategori: this.formEdit.kategori,
                upbjj: this.formEdit.upbjj,
                lokasiRak: this.formEdit.lokasiRak.trim(),
                harga: Number(this.formEdit.harga),
                qty: Number(this.formEdit.qty),
                safety: Number(this.formEdit.safety),
                catatanHTML: this.formEdit.catatanHTML.trim()
            });
            this.tutupModalEdit();
        },

        // --- Hapus ---
        bukaModalHapus: function (item) {
            this.hapusIndex = this.localStok.findIndex(function (s) { return s.kode === item.kode; });
            this.itemHapus = item;
            this.showModalHapus = true;
        },
        tutupModalHapus: function () { this.showModalHapus = false; this.itemHapus = null; this.hapusIndex = -1; },
        konfirmasiHapus: function () {
            if (this.hapusIndex > -1) this.localStok.splice(this.hapusIndex, 1);
            this.tutupModalHapus();
        },

        // --- Helpers ---
        _resetErr: function (obj) { Object.keys(obj).forEach(function (k) { obj[k] = ''; }); },
        _validasi: function (data, errObj, isNew) {
            this._resetErr(errObj);
            var ok = true;
            if (isNew) {
                if (!data.kode || !data.kode.trim()) { errObj.kode = 'Kode MK wajib diisi.'; ok = false; }
                else if (this.localStok.some(function (s) { return s.kode.toUpperCase() === data.kode.trim().toUpperCase(); })) {
                    errObj.kode = 'Kode MK sudah ada.'; ok = false;
                }
            }
            if (!data.judul || !data.judul.trim()) { errObj.judul = 'Judul wajib diisi.'; ok = false; }
            if (!data.kategori) { errObj.kategori = 'Kategori wajib dipilih.'; ok = false; }
            if (!data.upbjj) { errObj.upbjj = 'UT-Daerah wajib dipilih.'; ok = false; }
            if (!data.lokasiRak || !data.lokasiRak.trim()) { errObj.lokasiRak = 'Lokasi Rak wajib diisi.'; ok = false; }
            if (isNaN(Number(data.harga)) || Number(data.harga) < 0) { errObj.harga = 'Harga harus >= 0.'; ok = false; }
            if (isNaN(Number(data.qty))   || Number(data.qty) < 0)   { errObj.qty   = 'Qty harus >= 0.'; ok = false; }
            if (isNaN(Number(data.safety))|| Number(data.safety) < 0){ errObj.safety = 'Safety harus >= 0.'; ok = false; }
            return ok;
        }
    }
});
