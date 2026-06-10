/**
 * order-form.js – Komponen <ba-order-form>
 * Template: #tpl-order-form (di index.html)
 *
 * Fitur Vue:
 * - computed : nomorDoOtomatis, paketDipilih, totalHarga
 * - watch    : form.nim (sanitasi angka), form.paketKode (log perubahan)
 * - mounted  : isi tanggalKirim default dari Date()
 */
Vue.component('ba-order-form', {
    template: '#tpl-order-form',

    props: {
        paketList:      { type: Array, required: true },
        pengirimanList: { type: Array, required: true },
        trackingList:   { type: Array, required: true }
    },

    data: function () {
        return {
            form: { nim:'', nama:'', ekspedisi:'', paketKode:'', tanggalKirim:'' },
            err:  { nim:'', nama:'', ekspedisi:'', paketKode:'', tanggalKirim:'' }
        };
    },

    mounted: function () {
        this.form.tanggalKirim = this._tglIndo(new Date());
    },

    watch: {
        // Watcher 1: Sanitasi NIM agar hanya berisi angka
        'form.nim': function (baru) {
            var bersih = String(baru).replace(/\D/g, '');
            if (bersih !== String(baru)) this.form.nim = bersih;
        },

        // Watcher 2: Log ke konsol setiap kali paket berubah
        'form.paketKode': function (baru) {
            var p = this.paketList.find(function (x) { return x.kode === baru; });
            if (p) console.log('[order-form] Paket dipilih:', p.nama, '| Harga: Rp', p.harga);
        }
    },

    computed: {
        nomorDoOtomatis: function () {
            var tahun = new Date().getFullYear();
            var maxSeq = 0;
            this.trackingList.forEach(function (item) {
                var key = Object.keys(item)[0];
                var prefix = 'DO' + tahun + '-';
                if (key && key.startsWith(prefix)) {
                    var seq = parseInt(key.slice(prefix.length), 10);
                    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
                }
            });
            return 'DO' + tahun + '-' + String(maxSeq + 1).padStart(3, '0');
        },

        paketDipilih: function () {
            var kode = this.form.paketKode;
            return this.paketList.find(function (p) { return p.kode === kode; }) || null;
        },

        totalHarga: function () {
            return this.paketDipilih ? this.paketDipilih.harga : 0;
        }
    },

    methods: {
        submitForm: function () {
            if (!this._validasi()) return;
            var nomorDo = this.nomorDoOtomatis;
            var entry = {};
            entry[nomorDo] = {
                nim:          this.form.nim.trim(),
                nama:         this.form.nama.trim(),
                status:       'Dalam Perjalanan',
                ekspedisi:    this.form.ekspedisi,
                tanggalKirim: this.form.tanggalKirim.trim(),
                paket:        this.form.paketKode,
                total:        this.totalHarga,
                perjalanan:   [{ waktu: this._formatWaktu(new Date()), keterangan: 'DO dibuat.' }]
            };
            this.$emit('add-do', entry);
            alert('DO berhasil dibuat: ' + nomorDo);
            this.resetForm();
        },

        resetForm: function () {
            this.form = { nim:'', nama:'', ekspedisi:'', paketKode:'', tanggalKirim: this._tglIndo(new Date()) };
            Object.keys(this.err).forEach(function (k) { this.err[k] = ''; }, this);
        },

        _validasi: function () {
            var ok = true;
            Object.keys(this.err).forEach(function (k) { this.err[k] = ''; });
            if (!this.form.nim.trim())  { this.err.nim = 'NIM wajib diisi.'; ok = false; }
            else if (this.form.nim.trim().length < 5) { this.err.nim = 'NIM minimal 5 digit.'; ok = false; }
            if (!this.form.nama.trim()) { this.err.nama = 'Nama wajib diisi.'; ok = false; }
            if (!this.form.ekspedisi)   { this.err.ekspedisi = 'Pilih ekspedisi.'; ok = false; }
            if (!this.form.paketKode)   { this.err.paketKode = 'Pilih paket.'; ok = false; }
            if (!this.form.tanggalKirim.trim()) { this.err.tanggalKirim = 'Tanggal kirim wajib diisi.'; ok = false; }
            return ok;
        },

        _tglIndo: function (d) {
            var bln = ['Januari','Februari','Maret','April','Mei','Juni',
                       'Juli','Agustus','September','Oktober','November','Desember'];
            return d.getDate() + ' ' + bln[d.getMonth()] + ' ' + d.getFullYear();
        },

        _formatWaktu: function (d) {
            var p = function (n) { return String(n).padStart(2,'0'); };
            return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())
                   +' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
        }
    }
});
