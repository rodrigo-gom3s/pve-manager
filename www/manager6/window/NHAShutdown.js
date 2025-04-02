Ext.define('PVE.window.NHAShutdown', {
    extend: 'Ext.window.Window',
    width: '800px',
    title: gettext('HA - Shutdown'),
    iconCls: 'fa fa-power-off',
    modal: true,
    bodyPadding: 10,
    resizable: false,
    layout: 'hbox',

    items: [
        {
            xtype: 'form',
            layout: 'vbox',
            bodyPadding: 10,
            items: [
                {
                    xtype: 'checkbox',
                    firstStarted: true,
                    boxLabel: 'Enable Migrate on Shutdown',
                    itemId: 'migrateCheckbox',

                    listeners: {
                        change: function(checkbox, newValue) {                           
                                Ext.Ajax.request({
                                    url: '/api2/json/cluster/options',
                                    method: 'PUT',
                                    jsonData: { ha: "shutdown_policy=" + (checkbox.getValue() ? 'migrate' : 'conditional') },
                                    failure: function(response) {
                                        Ext.Msg.alert('Error', 'Failed to update HA setting');
                                    }
                                });
                        }
                    }
                }
            ]
        }
    ],

    listeners: {
        afterrender: function(view) {
            Ext.Ajax.request({
                url: '/api2/json/cluster/options',
                method: 'GET',
                success: function(response) {
                    let data = Ext.decode(response.responseText);
                    let checkbox = view.down('#migrateCheckbox');
                    checkbox.setValue(data.data.ha !== undefined && data.data.ha.shutdown_policy !== "conditional");
                },
                failure: function() {
                    Ext.Msg.alert('Error', 'Failed to load HA settings');
                }
            });
        }
    }
});
