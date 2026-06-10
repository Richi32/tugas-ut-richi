/**
 * app-modal.js – Komponen <ba-app-modal>
 * Template diambil dari <script type="text/x-template" id="tpl-app-modal"> di index.html
 */
Vue.component('ba-app-modal', {
    template: '#tpl-app-modal',
    props: {
        visible: { type: Boolean, required: true },
        title:   { type: String, default: 'Modal' }
    }
});
