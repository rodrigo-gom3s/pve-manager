Ext.define('PVE.window.NHAShutdown', {
    extend: 'Ext.window.Window',

    width: '800px',
    title: gettext('nHA - Shutdown'),
    iconCls: 'fa fa-power-off',
    modal: true,
    bodyPadding: 10,
    resizable: false,

    buttons: [
        {
            xtype: 'proxmoxHelpButton',
            onlineHelp: 'gui_my_settings',
            hidden: true,
        },
        '->',
        {
            text: gettext('Close'),
            handler: function() {
                this.up('window').close();
            },
        },
    ],

    layout: 'hbox',

    items: [
        {
            xtype: 'form',
            layout: 'vbox',
            bodyPadding: 10,
            items: [
                {
                    xtype: 'combobox',
                    fieldLabel: gettext('Select the node of the machine'),
                    store: {
                        xtype: 'store',
                        fields: ['id', 'name'],
                        data: [
                            { id: '1', name: 'pve1' },
                            { id: '2', name: 'pve2' },
                            { id: '3', name: 'pve3' },
                        ],
                    },
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    editable: false,
                    triggerAction: 'all',
                    width: 350,
                    listeners: {
                        select: function(combo, record) {
                            var secondCombo = combo.up('form').down('#secondComboBox');
                            if (record.get('id') === '1' || record.get('id') === '2' || record.get('id') === '3') {
                                secondCombo.show();
                            } else {
                                secondCombo.hide();
                            }
                        }
                    }
                },
                {
                    xtype: 'combobox',
                    itemId: 'secondComboBox',
                    fieldLabel: gettext('Select Second Option'),
                    store: {
                        xtype: 'store',
                        fields: ['id', 'name'],
                        data: [
                            { id: 'suboption1', name: 'Sub Option 1' },
                            { id: 'suboption2', name: 'Sub Option 2' },
                        ],
                    },
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    editable: false,
                    triggerAction: 'all',
                    width: 350,
                    hidden: true,
                },
            ]
        }
    ],

    controller: {
        xclass: 'Ext.app.ViewController',

        init: function(view) {
            var me = this;
        },
    },
});
