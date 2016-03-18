Ext.define('PVE.form.QemuBiosSelector', {
    extend: 'PVE.form.KVComboBox',
    alias: ['widget.pveQemuBiosSelector'],

    initComponent: function() {
	var me = this;

        me.data = [
	    ['', PVE.Utils.render_qemu_bios('')],
	    ['seabios', PVE.Utils.render_qemu_bios('seabios')],
	    ['ovmf', PVE.Utils.render_qemu_bios('ovmf')]
	];

	me.callParent();
    }
});
