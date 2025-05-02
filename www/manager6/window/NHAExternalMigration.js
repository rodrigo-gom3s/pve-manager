Ext.define('PVE.window.NHAExternalMigration', {
    extend: 'Ext.window.Window',
    width: '800px',
    title: gettext('Remote Migration'),
    iconCls: 'fa fa-exchange',
    modal: true,
    bodyPadding: 10,
    resizable: false,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            xtype: 'container',
            layout: 'hbox',
            width: '100%',
            items: [
                {
                    xtype: 'container',
                    flex: 1,
                    layout: 'anchor',
                    items: [
                        {
                            xtype: 'combobox',
                            fieldLabel: 'VM Node',
                            itemId: 'nodeSelect',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['nome'],
                                data: []
                            }),
                            valueField: 'node',
                            displayField: 'node',
                            queryMode: 'local',
                            editable: false,
                            anchor: '100%',
                            width: 250,
                            listeners: {
                                afterrender: function (combo) {
                                    Proxmox.Utils.API2Request({
                                        url: '/nodes',
                                        method: 'GET',
                                        success: function (response) {
                                            combo.getStore().setData(response.result.data);
                                        },
                                        failure: function () {
                                            Ext.Msg.alert('Error', 'Failed to load nodes.');
                                        }
                                    });
                                },
                                select: function (combo, record) {
                                    const vmCombo = combo.up('window').down('#vmSelect');
                                    vmCombo.setDisabled(false);
                                    vmCombo.show();
                                    Proxmox.Utils.API2Request({
                                        url: '/nodes/' + record.get('node') + '/qemu',
                                        method: 'GET',
                                        success: function (response) {
                                            vmCombo.getStore().setData(response.result.data);
                                        }
                                    });
                                }
                            }
                        }
                    ]
                },
                {
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'hbox',
                        pack: 'end'
                    },
                    items: [
                        {
                            xtype: 'combobox',
                            itemId: 'vmSelect',
                            fieldLabel: 'Virtual Machine ID (VMID)',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['vmid'],
                                data: []
                            }),
                            valueField: 'vmid',
                            displayField: 'vmid',
                            queryMode: 'local',
                            editable: false,
                            hidden: true,
                            disabled: true,
                            width: 250,
                            listeners: {
                                select: function (combo) {
                                    const inputsContainer = combo.up('window').down('#destinationSettings');
                                    inputsContainer.show();
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'container',
            itemId: 'destinationSettings',
            layout: 'anchor',
            hidden: true,
            margin: '20 0 0 0',
            defaults: {
                xtype: 'textfield',
                anchor: '100%',
                labelWidth: 150
            },
            items: [
                { fieldLabel: 'Host IP', name: 'host', emptyText: 'ex: 192.168.10.10' },
                { fieldLabel: 'Username ', name: 'username', emptyText: 'ex: root@pam' },
                { fieldLabel: 'Token ID', name: 'tokenID', emptyText: 'ex: token1' },
                { fieldLabel: 'Token Secret', name: 'secret', emptyText: 'ex: 123456ab-c12d-345e-6f7g-891234hi5j6k' },
                { fieldLabel: 'Fingerprint', name: 'fingerprint', emptyText: 'ex: aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99' },
                { fieldLabel: 'Target Storage', name: 'storage', emptyText: 'ex: disk1' },
                { fieldLabel: 'Target Bridge', name: 'bridge', emptyText: 'ex: vmbr0' },
            ]
        }
    ],
    buttons: [
        {
            text: 'Migrate',
            iconCls: 'fa fa-play',
            formBind: true,
            handler: function (btn) {
                const win = btn.up('window');
                const node = win.down('#nodeSelect').getValue();
                const vmid = win.down('#vmSelect').getValue();
                const host = win.down('[name=host]').getValue();
                const user = win.down('[name=username]').getValue();
                const tokenID = win.down('[name=tokenID]').getValue();
                const secret = win.down('[name=secret]').getValue();
                const storage = win.down('[name=storage]').getValue();
                const bridge = win.down('[name=bridge]').getValue();
                const fingerprint = win.down('[name=fingerprint]').getValue();
                if (!node || !vmid || !host || !user || !tokenID || !secret || !storage || !bridge || !fingerprint) {
                    Ext.Msg.alert('Error', 'All fields are required.');
                }else{    
                    Ext.Ajax.request({
                    url: 'https://pveha.duckdns.org:5000/rest/remotemigration',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    jsonData: {
                        "node": node,
                        "vmID": vmid,
                        "target_endpoint": "apitoken=PVEAPIToken="+user+"!"+tokenID+"="+secret+",host="+host+",fingerprint="+fingerprint,
                        "target_storage": storage,
                        "target_bridge": bridge,
                    },
                    success: function () {
                        Ext.Msg.show({
                            title:'External Migration',
                            msg: 'External migration has been started for selected VM',
                            buttons: Ext.Msg.OK,
                            animEl: 'elId',
                            icon: Ext.MessageBox.INFO
                         });
                        win.close();
                    },
                    failure: function (response) {
                        console.log(response);
                        Ext.Msg.alert('Error', 'External migration failed<br><br>Please check if the VM does not belong to a HA group<br>and if it does not have any snapshots');
                    }
                })
                }
            }
        }
    ]
});
