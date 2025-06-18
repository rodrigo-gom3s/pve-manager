Ext.define('PVE.window.NHAConfigJSON', {
    extend: 'Ext.window.Window',
    width: '800px',
    title: gettext('Remote Migration - Create Config'),
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
            layout: 'anchor',
            width: '100%',
            defaults: {
                anchor: '100%',
                width: 250,
                margin: '10 0'
            },
            items: [
                {
                    xtype: 'combobox',
                    fieldLabel: 'VM Node',
                    itemId: 'nodeSelect',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['node'],
                        data: []
                    }),
                    valueField: 'node',
                    displayField: 'node',
                    queryMode: 'local',
                    editable: false,
                    listeners: {
                        afterrender: function (combo) {
                            Proxmox.Utils.API2Request({
                                url: '/nodes',
                                method: 'GET',
                                success: function (response) {
                                    combo.getStore().setData(response.result.data);
                                }
                            });
                        },
                        select: function (combo, record) {
                            var node = record.get('node');
                            var win = combo.up('window');
                            var diskCombo = combo.up().down('#diskSelect');
                            var netCombo = combo.up().down('#networkSelect');
                            diskCombo.setValue(null);
                            diskCombo.setDisabled(false);
                            netCombo.setValue(null);
                            netCombo.setDisabled(false);

                            Proxmox.Utils.API2Request({
                                url: '/cluster/resources',
                                method: 'GET',
                                success: function (response) {
                                    var responseData = response.result.data;
                                    let disks = [];
                                    responseData.forEach(function (item) {
                                        if(item.node === node) {
                                            disks.push(item);
                                        }
                                    });
                                    diskCombo.getStore().setData(disks);
                                },failure: function (response) {
                                    console.log(response);
                                    Ext.Msg.alert('Error', 'Failed to load disks.');
                                    win.close();
                                }
                            });
            
                            Proxmox.Utils.API2Request({
                                url: '/nodes/' + node + '/network',
                                method: 'GET',
                                success: function (response) {
                                    netCombo.getStore().setData(response.result.data);
                                },failure: function (response) {
                                    console.log(response);
                                    Ext.Msg.alert('Error', 'Failed to load network interfaces.');
                                    win.close();
                                }
                            });
                        }
                    }
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'Destination Storage',
                    itemId: 'diskSelect',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['storage']
                    }),
                    valueField: 'storage',
                    displayField: 'storage',
                    queryMode: 'local',
                    editable: false,
                    disabled: true
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'Bridge Interface',
                    itemId: 'networkSelect',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['iface']
                    }),
                    valueField: 'iface',
                    displayField: 'iface',
                    queryMode: 'local',
                    editable: false,
                    disabled: true
                }
            ]
            
        },        
        {
            xtype: 'container',
            itemId: 'destinationSettings',
            layout: 'anchor',
            margin: '20 0 0 0',
            defaults: {
                xtype: 'textfield',
                anchor: '100%',
                labelWidth: 150
            },
            items: [
                { fieldLabel: 'Host IP', name: 'host', emptyText: 'ex: 192.168.10.10' },
            ]
        }
    ],
    buttons: [
        {
            text: 'Create File',
            iconCls: 'fa fa-file',
            formBind: true,
            handler: function (btn) {
                const win = btn.up('window');
                const node = win.down('#nodeSelect').getValue();
                const host = win.down('[name=host]').getValue();
                const bridge = win.down('#networkSelect').getValue();
                const disk = win.down('#diskSelect').getValue();

                if (!node || !host || !disk || !bridge ) {
                    Ext.Msg.alert('Error', 'All fields are required.');
                }else{    
                    Ext.Ajax.request({
                    url: 'https://pve-teste.duckdns.org:5000/rest/remotemigration/createtoken',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    jsonData: {
                        "node": node,
                        "ipaddress": host,
                        "target_storage": disk,
                        "target_bridge": bridge,
                    },
                    success: function (response) {
                        Ext.Msg.show({
                            title:'Remote Migration',
                            msg: 'Remote migration file has been created for selected node',
                            buttons: Ext.Msg.OK,
                            animEl: 'elId',
                            icon: Ext.MessageBox.INFO
                         });

                         let file = new Blob([response.responseText], { type: 'application/json' });
                         const link = document.createElement('a');
                         link.href = URL.createObjectURL(file);
                         link.download = "migration_config_" + host +"_" + node + ".json";
                         document.body.appendChild(link);
                         link.click();
                         document.body.removeChild(link);
                         URL.revokeObjectURL(link.href);

                        win.close();
                    },
                    failure: function (response) {
                        console.log(response);
                        Ext.Msg.alert('Error', 'Remote migration file creation failed.');
                    }
                })
                }
            }
        }
    ]
});
