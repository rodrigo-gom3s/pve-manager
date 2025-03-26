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
                    itemId: 'nodeComboBox',
                    fieldLabel: gettext('Select the node of the machine'),
                    store: {
                        xtype: 'store',
                        fields: ['id', 'name'],
                        data: [],
                    },
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    editable: false,
                    triggerAction: 'all',
                    width: 350,
                    listeners: {
                        select: function(combo, record) {
                            // Define and show the secondary menu when a node is selected
                            var secondaryMenu = Ext.create('Ext.menu.Menu', {
                                items: [
                                    {
                                        text: 'Option 1',
                                        handler: function() {
                                            Ext.Msg.alert('Selected', 'You selected Option 1 for ' + record.get('name'));
                                        }
                                    },
                                    {
                                        text: 'Option 2',
                                        handler: function() {
                                            Ext.Msg.alert('Selected', 'You selected Option 2 for ' + record.get('name'));
                                        }
                                    }
                                ]
                            });

                            // Show menu near the combobox
                            secondaryMenu.showBy(combo);
                        }
                    }
                },
            ]
        }
    ],

    controller: {
        xclass: 'Ext.app.ViewController',

        init: function(view) {
            var params = {};  // Example params if needed

            Proxmox.Utils.API2Request({
                params: params,
                url: 'api2/json/nodes',
                waitMsgTarget: view,
                method: 'GET',
                failure: function(response, opts) {
                    Ext.Msg.alert(gettext('Error'), response.statusText || 'Unknown error');
                },
                success: function(response, options) {
                    var result = response.result.data;
                    var nodes_array = [];
                    result.forEach(node => {
                        nodes_array.push({ id: node.node, name: node.node });
                    });

                    var combo = Ext.ComponentQuery.query('combobox[itemId=nodeComboBox]')[0];
                    if (combo) {
                        combo.getStore().loadData(nodes_array);
                    }
                },
            });
        },
    },
});
