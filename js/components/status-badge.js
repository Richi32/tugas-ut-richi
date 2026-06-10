/**
 * status-badge.js – Komponen <ba-status-badge>
 * Template: #tpl-status-badge (di index.html)
 */
Vue.component('ba-status-badge', {
    template: '#tpl-status-badge',
    props: {
        qty:     { type: Number, required: true },
        safety:  { type: Number, required: true },
        catatan: { type: String, default: '' }
    }
});
